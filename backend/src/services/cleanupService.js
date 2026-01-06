import prisma from '../lib/prisma.js';

/**
 * Auto cleanup task that runs daily
 * Deletes:
 * - Messages older than 7 days
 * - Read notifications older than 7 days
 */
export const autoCleanup = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Delete messages older than 7 days
        const deletedMessages = await prisma.message.deleteMany({
            where: {
                createdAt: {
                    lt: sevenDaysAgo
                }
            }
        });

        // Delete read notifications older than 7 days
        const deletedNotifications = await prisma.notification.deleteMany({
            where: {
                read: true,
                createdAt: {
                    lt: sevenDaysAgo
                }
            }
        });

        console.log(`[Auto Cleanup] Deleted ${deletedMessages.count} old messages and ${deletedNotifications.count} read notifications`);

        return {
            messagesDeleted: deletedMessages.count,
            notificationsDeleted: deletedNotifications.count
        };
    } catch (error) {
        console.error('[Auto Cleanup] Error:', error);
        throw error;
    }
};
