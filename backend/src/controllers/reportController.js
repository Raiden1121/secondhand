import prisma from '../lib/prisma.js';

// Report a product
export const createReport = async (req, res) => {
    try {
        const { productId, reason } = req.body;
        const userId = req.user.id;

        if (!productId || !reason) {
            return res.status(400).json({ message: '請提供商品ID和檢舉原因' });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) }
        });

        if (!product) {
            return res.status(404).json({ message: '商品不存在' });
        }

        // Prevent reporting own product
        if (product.sellerId === userId) {
            return res.status(400).json({ message: '無法檢舉自己的商品' });
        }

        // Create report
        const report = await prisma.report.create({
            data: {
                userId,
                productId: parseInt(productId),
                reason
            }
        });

        // Notify the seller about the report
        await prisma.notification.create({
            data: {
                userId: product.sellerId,
                type: 'report',
                title: '商品被檢舉',
                content: `您的商品「${product.title}」被檢舉，原因：${reason}`,
                data: JSON.stringify({ productId: product.id, reason })
            }
        });

        res.status(201).json({ message: '檢舉已送出，我們會盡快處理', report });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all reports (admin only - for future use)
export const getReports = async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { title: true, sellerId: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: error.message });
    }
};
