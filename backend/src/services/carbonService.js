import { GoogleGenAI } from '@google/genai';
import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();
import path from 'path';

const dbPath = path.join(process.cwd(), '../SDGs/emission_factors.db');
const MATCH_MODEL = 'gemini-2.5-flash';

// Read categories from SQLite
const getCategories = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) return reject(err);
        });

        db.all("SELECT cc_id, name, level1, level2 FROM categories", [], (err, rows) => {
            db.close();
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Read a specific coefficient by cc_id
const getCoefficient = (cc_id) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) return reject(err);
        });

        db.get("SELECT value_numeric FROM coefficients WHERE cc_id = ? LIMIT 1", [cc_id], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row ? row.value_numeric : null);
        });
    });
};

const normalizeText = (...parts) => parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const keywordRules = [
    {
        type: 'bicycle',
        keywords: ['腳踏車', '自行車', '單車', 'bike', 'bicycle'],
        components: ['自行車外胎', '鋼', '鋁', '橡膠']
    },
    {
        type: 'book',
        keywords: ['書', '課本', '教材', 'book'],
        components: ['書']
    },
    {
        type: 'fan',
        keywords: ['電風扇', '風扇', 'fan'],
        components: ['鋼', '塑膠', '馬達']
    }
];

const detectRule = (title, description, category) => {
    const text = normalizeText(title, category, description);
    return keywordRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) || null;
};

const buildComponentCandidates = (categories, title, description, category) => {
    const rule = detectRule(title, description, category);
    if (!rule) return [];

    const candidates = categories.filter((item) => {
        const haystack = normalizeText(item.name, item.level1, item.level2);
        return rule.components.some((keyword) => haystack.includes(keyword.toLowerCase()));
    });

    return candidates.slice(0, 30);
};

const pickSingleCategory = async (ai, title, description, category, categories) => {
    const catListText = categories.map(c => `ID: ${c.cc_id}, Name: ${c.name}, Category: ${c.level1} > ${c.level2}`).join('\n');
    const prompt = `
You are an expert in environmental science and carbon footprint analysis. 
We need to estimate the carbon emissions saved when someone buys a secondhand item instead of a new one.

Here is a new secondhand product listed on our platform:
Title: "${title}"
Category: "${category}"
Description: "${description}"

We have a database of carbon emission factors. Here are the available categories:
${catListText}

Task: Choose the single most appropriate category ID (cc_id) from the list above that matches the product.
Output ONLY the integer ID. Do not include any other text, explanation, or markdown formatting.
If nothing matches closely, just output 0.
`;

    const response = await ai.models.generateContent({
        model: MATCH_MODEL,
        contents: prompt,
        config: {
            temperature: 0.1,
        }
    });

    const resultText = response.text.trim();
    return parseInt(resultText, 10);
};

const estimateCompositeCarbon = async (ai, title, description, category, candidates) => {
    if (candidates.length === 0) {
        return 0.0;
    }

    const candidateText = candidates
        .map((item) => `ID: ${item.cc_id}, Name: ${item.name}, Category: ${item.level1} > ${item.level2}`)
        .join('\n');

    const prompt = `
You are estimating secondhand product carbon savings using a restricted component list.

Product:
Title: "${title}"
Category: "${category}"
Description: "${description}"

Allowed component categories from the database:
${candidateText}

Task:
1. Infer the likely major components this product is made from.
2. Use ONLY the allowed component categories above.
3. Return 1 to 4 components.
4. Assign each component a weight between 0 and 1.
5. The weights must sum to 1.
6. If the product still cannot be reasonably estimated from this list, return {"components":[]}.

Output ONLY valid JSON in this exact format:
{"components":[{"cc_id":123,"weight":0.5}]}
`;

    const response = await ai.models.generateContent({
        model: MATCH_MODEL,
        contents: prompt,
        config: {
            temperature: 0.1,
            responseMimeType: 'application/json'
        }
    });

    let parsed;
    try {
        parsed = JSON.parse(response.text.trim());
    } catch (error) {
        console.warn('[SDG] Failed to parse composite estimation response:', response.text);
        return 0.0;
    }

    const rawComponents = Array.isArray(parsed?.components) ? parsed.components : [];
    const validIds = new Set(candidates.map((item) => item.cc_id));
    const components = rawComponents
        .filter((item) => validIds.has(item.cc_id) && Number.isFinite(Number(item.weight)) && Number(item.weight) > 0)
        .map((item) => ({
            cc_id: item.cc_id,
            weight: Number(item.weight)
        }));

    if (components.length === 0) {
        return 0.0;
    }

    const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight <= 0) {
        return 0.0;
    }

    let carbonSaved = 0.0;
    for (const component of components) {
        const coefficient = await getCoefficient(component.cc_id);
        if (coefficient !== null) {
            carbonSaved += coefficient * (component.weight / totalWeight);
        }
    }

    const componentSummary = components
        .map((item) => `${item.cc_id}:${item.weight}`)
        .join(', ');
    console.log(`[SDG] Composite estimate for "${title}" using components ${componentSummary}, Carbon Value: ${carbonSaved}`);

    return carbonSaved;
};

/**
 * Categorize a product using Gemini and return the estimated carbon reduction.
 * @param {string} title 
 * @param {string} description 
 * @param {string} category 
 * @returns {Promise<number>} carbon reduction amount (kgCO2e)
 */
const calculateCarbonReduction = async (title, description, category) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping carbon calculation.');
        return 0.0;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const categories = await getCategories();
        const cc_id = await pickSingleCategory(ai, title, description, category, categories);

        if (isNaN(cc_id) || cc_id === 0) {
            const componentCandidates = buildComponentCandidates(categories, title, description, category);
            const compositeEstimate = await estimateCompositeCarbon(ai, title, description, category, componentCandidates);

            if (compositeEstimate > 0) {
                return compositeEstimate;
            }

            console.log(`[SDG] No matching cc_id found for product: ${title}`);
            return 0.0;
        }

        const value = await getCoefficient(cc_id);
        if (value !== null) {
            console.log(`[SDG] Product "${title}" matched cc_id: ${cc_id}, Carbon Value: ${value}`);
            return value;
        }

        return 0.0;

    } catch (error) {
        console.error('[SDG] Error calculating carbon reduction:', error);
        return 0.0;
    }
};

export {
    calculateCarbonReduction
};
