import prisma from '../lib/prisma.js';

// Create a purchase request (buyer initiates)
export const createPurchaseRequest = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { productId } = req.body;

        // Get product info
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
            include: { seller: true }
        });

        if (!product) {
            return res.status(404).json({ message: '找不到商品' });
        }

        if (product.sellerId === buyerId) {
            return res.status(400).json({ message: '不能購買自己的商品' });
        }

        // Check if there's already a pending transaction
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                productId: parseInt(productId),
                buyerId,
                status: 'pending'
            }
        });

        if (existingTransaction) {
            return res.status(400).json({ message: '您已對此商品發送購買請求' });
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                productId: parseInt(productId),
                buyerId,
                sellerId: product.sellerId,
                status: 'pending'
            },
            include: {
                product: true,
                buyer: { select: { id: true, name: true, avatar: true } }
            }
        });

        // Create notification for seller
        await prisma.notification.create({
            data: {
                userId: product.sellerId,
                type: 'purchase_request',
                title: '購買請求',
                content: `${transaction.buyer.name} 想購買您的商品「${product.title}」`,
                data: JSON.stringify({ transactionId: transaction.id, productId: product.id })
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating purchase request:', error);
        res.status(500).json({ message: error.message });
    }
};

// Seller confirms the purchase
export const confirmPurchase = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { transactionId } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) },
            include: {
                product: true,
                buyer: { select: { id: true, name: true } }
            }
        });

        if (!transaction) {
            return res.status(404).json({ message: '找不到交易記錄' });
        }

        if (transaction.sellerId !== sellerId) {
            return res.status(403).json({ message: '無權確認此交易' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: '此交易已處理' });
        }

        // Use Prisma transaction to ensure both updates succeed or fail together
        const [updatedTransaction, updatedProduct] = await prisma.$transaction([
            prisma.transaction.update({
                where: { id: parseInt(transactionId) },
                data: { status: 'confirmed' },
                include: {
                    product: true,
                    buyer: { select: { id: true, name: true } },
                    seller: { select: { id: true, name: true } }
                }
            }),
            prisma.product.update({
                where: { id: transaction.productId },
                data: { status: 'sold' }
            })
        ]);

        // Create notifications for both parties to rate
        const carbonSaved = updatedTransaction.product?.carbonSaved || 0;
        
        await prisma.notification.createMany({
            data: [
                {
                    userId: transaction.buyerId,
                    type: 'rate_prompt',
                    title: '交易完成',
                    content: `您購買「${transaction.product.title}」的交易已確認，請評價賣家`,
                    data: JSON.stringify({ transactionId: transaction.id, carbonSaved })
                },
                {
                    userId: sellerId,
                    type: 'rate_prompt',
                    title: '交易完成',
                    content: `您出售「${transaction.product.title}」的交易已確認，請評價買家`,
                    data: JSON.stringify({ transactionId: transaction.id, carbonSaved })
                }
            ]
        });

        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error confirming purchase:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cancel a transaction
export const cancelTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) },
            include: {
                product: true,
                buyer: { select: { id: true, name: true } },
                seller: { select: { id: true, name: true } }
            }
        });

        if (!transaction) {
            return res.status(404).json({ message: '找不到交易記錄' });
        }

        if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
            return res.status(403).json({ message: '無權取消此交易' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: '此交易已處理，無法取消' });
        }

        const updatedTransaction = await prisma.transaction.update({
            where: { id: parseInt(transactionId) },
            data: { status: 'cancelled' }
        });

        // Notify the buyer that the transaction was cancelled
        if (userId === transaction.sellerId) {
            await prisma.notification.create({
                data: {
                    userId: transaction.buyerId,
                    type: 'purchase_cancelled',
                    title: '購買請求已取消',
                    content: `賣家已取消您對「${transaction.product.title}」的購買請求`,
                    data: JSON.stringify({ productId: transaction.productId })
                }
            });
        }

        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error cancelling transaction:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get transaction details
export const getTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) },
            include: {
                product: { include: { seller: { select: { id: true, name: true, avatar: true } } } },
                buyer: { select: { id: true, name: true, avatar: true } },
                seller: { select: { id: true, name: true, avatar: true } },
                ratings: true
            }
        });

        if (!transaction) {
            return res.status(404).json({ message: '找不到交易記錄' });
        }

        if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
            return res.status(403).json({ message: '無權查看此交易' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get pending purchase requests for product (check if user already requested)
export const getProductTransactionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const transaction = await prisma.transaction.findFirst({
            where: {
                productId: parseInt(productId),
                buyerId: userId,
                status: { in: ['pending', 'confirmed'] }
            }
        });

        res.json({ hasPendingRequest: !!transaction, transaction });
    } catch (error) {
        console.error('Error checking transaction status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get platform-wide carbon reduction stats
export const getCarbonStats = async (req, res) => {
    try {
        const stats = await prisma.product.aggregate({
            _sum: {
                carbonSaved: true
            },
            where: {
                transactions: {
                    some: {
                        status: { in: ['confirmed', 'completed'] }
                    }
                }
            }
        });
        
        const totalCarbonSaved = stats._sum.carbonSaved || 0;
        res.json({ totalCarbonSaved });
    } catch (error) {
        console.error('Error getting carbon stats:', error);
        res.status(500).json({ message: error.message });
    }
};
