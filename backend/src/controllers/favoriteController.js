import prisma from '../lib/prisma.js';

// Add product to favorites
export const addFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) }
        });

        if (!product) {
            return res.status(404).json({ message: '商品不存在' });
        }

        // Prevent favoriting own product
        if (product.sellerId === userId) {
            return res.status(400).json({ message: '無法收藏自己的商品' });
        }

        // Create favorite (will fail if already exists due to unique constraint)
        const favorite = await prisma.favorite.create({
            data: {
                userId,
                productId: parseInt(productId)
            }
        });

        res.status(201).json({ message: '已加入收藏', favorite });
    } catch (error) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return res.status(400).json({ message: '已經收藏過此商品' });
        }
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: error.message });
    }
};

// Remove product from favorites
export const removeFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const deleted = await prisma.favorite.deleteMany({
            where: {
                userId,
                productId: parseInt(productId)
            }
        });

        if (deleted.count === 0) {
            return res.status(404).json({ message: '未找到此收藏' });
        }

        res.json({ message: '已取消收藏' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all favorites for current user
export const getMyFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        seller: {
                            select: { name: true, department: true, avatar: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Return just the products
        const products = favorites.map(f => f.product);
        res.json(products);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: error.message });
    }
};

// Check if product is favorited
export const checkFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: parseInt(productId)
                }
            }
        });

        res.json({ isFavorited: !!favorite });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ message: error.message });
    }
};
