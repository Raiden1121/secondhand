import prisma from '../lib/prisma.js';

export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { seller: { select: { name: true, department: true, avatar: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
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
        const { title, price, description, category, images, status, location } = req.body;

        // Simple validation
        if (!title || !price) return res.status(400).json({ message: 'Title and price are required' });

        const product = await prisma.product.create({
            data: {
                title,
                price: parseInt(price),
                description,
                category,
                images: images || '[]',
                status: status || 'active',
                location,
                sellerId: req.user.id // From auth middleware
            }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
