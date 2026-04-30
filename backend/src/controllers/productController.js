import prisma from '../lib/prisma.js';
import { calculateCarbonReduction } from '../services/carbonService.js';

export const getProducts = async (req, res) => {
    try {
        const { sellerId, excludeUserId } = req.query;
        const where = { deleted: false }; // Exclude soft-deleted products

        if (sellerId) {
            where.sellerId = parseInt(sellerId);
        }

        // Exclude current user's products on homepage
        if (excludeUserId) {
            where.sellerId = { not: parseInt(excludeUserId) };
        }

        // If fetching specific seller's products, show active and reserved (hide sold)
        // If fetching for homepage (no sellerId), only show active products
        if (sellerId) {
            where.status = { not: 'sold' };
        } else {
            where.status = 'active';
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                seller: { select: { name: true, department: true, avatar: true } },
                _count: { select: { favorites: true } }
            },
            orderBy: [
                { reserved: 'asc' }, // Unreserved (false) first
                { createdAt: 'desc' }
            ]
        });

        // Format response to include favoritesCount at top level
        const formattedProducts = products.map(p => ({
            ...p,
            favoritesCount: p._count?.favorites || 0,
            _count: undefined
        }));

        res.json(formattedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { seller: { select: { name: true, department: true, avatar: true } } }
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { title, price, description, category, status, location, condition, deliveryMethod, negotiable } = req.body;

        // Simple validation
        if (!title || !price) return res.status(400).json({ message: 'Title and price are required' });

        // Handle uploaded images from multer
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        }

        const product = await prisma.product.create({
            data: {
                title,
                price: parseInt(price),
                description,
                category,
                images: JSON.stringify(imagePaths),
                status: status || 'active',
                location,
                condition: condition || '全新',
                deliveryMethod: deliveryMethod || '面交',
                negotiable: negotiable === 'true' || negotiable === true,
                sellerId: req.user.id // From auth middleware
            }
        });
        
        // Asynchronously calculate carbon reduction
        calculateCarbonReduction(title, description, category).then(async (carbonSaved) => {
            if (carbonSaved > 0) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { carbonSaved }
                });
                console.log(`[SDG] Updated carbonSaved for Product ID ${product.id}: ${carbonSaved} kgCO2e`);
            }
        }).catch(err => console.error('[SDG] Background carbon calculation failed:', err));

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                sellerId: req.user.id,
                deleted: false // Exclude soft-deleted products
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, description, category, status, location, condition, existingImages, imageOrder } = req.body;

        // Ensure product exists and belongs to user
        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (existingProduct.sellerId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Handle images
        let finalImages = [];
        let orderProcessed = false;

        let newImagePaths = [];
        if (req.files && req.files.length > 0) {
            newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
        }

        // 1. Try to use imageOrder for explicit ordering
        if (imageOrder) {
            try {
                const order = JSON.parse(imageOrder);
                if (Array.isArray(order)) {
                    let newIdx = 0;
                    finalImages = order.map(token => {
                        if (typeof token === 'string' && token.startsWith('new-token-')) {
                            return newImagePaths[newIdx++] || null;
                        }
                        return token;
                    }).filter(Boolean);
                    orderProcessed = true;
                }
            } catch (e) {
                console.error('Error processing imageOrder:', e);
            }
        }

        // 2. Fallback: Merge existing + new (if order logic failed or not provided)
        if (!orderProcessed) {
            // 1. Process existing images (from JSON string or array)
            if (existingImages) {
                try {
                    const parsed = JSON.parse(existingImages);
                    if (Array.isArray(parsed)) {
                        finalImages = parsed;
                    }
                } catch (e) {
                    console.error('Error parsing existing images:', e);
                }
            }

            // 2. Add new uploaded images
            if (req.files && req.files.length > 0) {
                const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
                finalImages = [...finalImages, ...newImagePaths];
            }
        }

        // If no images provided at all (and no new files), maybe keep original? 
        // Logic: if existingImages is sent (even empty), user intends to update images.
        // If undefined, maybe we shouldn't touch images? 
        // But FormData sends empty string for undefined fields usually?
        // Let's assume if existingImages is present, we rely on it + req.files.

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                title,
                price: parseInt(price),
                description,
                category,
                images: JSON.stringify(finalImages),
                status,
                location,
                condition
            }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure product exists and belongs to user
        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (existingProduct.sellerId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Soft delete: mark as deleted instead of actually removing
        await prisma.product.update({
            where: { id: parseInt(id) },
            data: { deleted: true }
        });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteAllSoldProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Soft delete all sold products for this user
        const result = await prisma.product.updateMany({
            where: {
                sellerId: userId,
                status: 'sold',
                deleted: false
            },
            data: { deleted: true }
        });

        res.json({
            message: 'All sold products deleted',
            count: result.count
        });
    } catch (error) {
        console.error('Delete all sold products error:', error);
        res.status(500).json({ message: error.message });
    }
};


export const toggleReserve = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (existingProduct.sellerId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { reserved: !existingProduct.reserved }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
