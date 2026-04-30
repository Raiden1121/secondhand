import { GoogleGenAI } from '@google/genai';
import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();
import path from 'path';

const dbPath = path.join(process.cwd(), '../SDGs/emission_factors.db');

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
        
        // Prepare list of categories for prompt
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
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Keep it deterministic
            }
        });

        const resultText = response.text.trim();
        const cc_id = parseInt(resultText, 10);

        if (isNaN(cc_id) || cc_id === 0) {
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
