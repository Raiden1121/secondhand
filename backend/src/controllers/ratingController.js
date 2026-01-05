import prisma from '../lib/prisma.js';

// Submit a rating for a transaction
export const submitRating = async (req, res) => {
    try {
        const raterId = req.user.id;
        const { transactionId, score, comment } = req.body;

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ message: '評分必須在 1-5 之間' });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) },
            include: { buyer: true, seller: true }
        });

        if (!transaction) {
            return res.status(404).json({ message: '找不到交易記錄' });
        }

        if (transaction.status !== 'confirmed') {
            return res.status(400).json({ message: '交易尚未確認，無法評價' });
        }

        if (transaction.buyerId !== raterId && transaction.sellerId !== raterId) {
            return res.status(403).json({ message: '無權評價此交易' });
        }

        // Determine who is being rated
        const ratedUserId = raterId === transaction.buyerId
            ? transaction.sellerId
            : transaction.buyerId;

        // Check if already rated
        const existingRating = await prisma.rating.findUnique({
            where: {
                transactionId_raterId: {
                    transactionId: parseInt(transactionId),
                    raterId
                }
            }
        });

        if (existingRating) {
            return res.status(400).json({ message: '您已評價過此交易' });
        }

        // Create rating
        const rating = await prisma.rating.create({
            data: {
                transactionId: parseInt(transactionId),
                raterId,
                ratedUserId,
                score: parseInt(score),
                comment: comment || null
            }
        });

        // Check if both parties have rated - if so, mark transaction as completed
        const allRatings = await prisma.rating.findMany({
            where: { transactionId: parseInt(transactionId) }
        });

        if (allRatings.length === 2) {
            await prisma.transaction.update({
                where: { id: parseInt(transactionId) },
                data: { status: 'completed' }
            });
        }

        res.status(201).json(rating);
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user's average rating
export const getUserRating = async (req, res) => {
    try {
        const { userId } = req.params;

        const ratings = await prisma.rating.findMany({
            where: { ratedUserId: parseInt(userId) },
            include: {
                rater: { select: { id: true, name: true, avatar: true } },
                transaction: { include: { product: { select: { id: true, title: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const averageScore = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        res.json({
            averageScore: Math.round(averageScore * 10) / 10,
            totalRatings: ratings.length,
            ratings
        });
    } catch (error) {
        console.error('Error getting user rating:', error);
        res.status(500).json({ message: error.message });
    }
};

// Check if user has rated a transaction
export const checkRatingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { transactionId } = req.params;

        const rating = await prisma.rating.findUnique({
            where: {
                transactionId_raterId: {
                    transactionId: parseInt(transactionId),
                    raterId: userId
                }
            }
        });

        res.json({ hasRated: !!rating, rating });
    } catch (error) {
        console.error('Error checking rating status:', error);
        res.status(500).json({ message: error.message });
    }
};
