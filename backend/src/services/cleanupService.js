import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to safely delete file
const deleteFile = (filePath) => {
    if (!filePath) return;

    // Convert relative URL path (/uploads/filename.jpg) to absolute path
    const normalizedPath = filePath.startsWith('/uploads/')
        ? filePath.replace('/uploads/', '')
        : filePath;

    const fullPath = path.join(__dirname, '../../uploads', normalizedPath);

    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (err) {
            console.error(`[Auto Cleanup] Failed to delete file ${fullPath}:`, err);
        }
    }
};

/**
 * Auto cleanup task that runs daily
 * Deletes:
 * - Messages older than 7 days (and their attached images)
 * - Read notifications older than 7 days
 * - Soft-deleted products older than 30 days (and their images)
 * - Cancelled transactions older than 30 days
 */
export const autoCleanup = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let filesDeleted = 0;

        // --- 1. Cleanup Old Messages & Their Images ---
        const oldMessages = await prisma.message.findMany({
            where: { createdAt: { lt: sevenDaysAgo } }
        });

        for (const msg of oldMessages) {
            if (msg.image) {
                deleteFile(msg.image);
                filesDeleted++;
            }
        }

        const deletedMessages = await prisma.message.deleteMany({
            where: { createdAt: { lt: sevenDaysAgo } }
        });

        // --- 2. Cleanup Read Notifications ---
        const deletedNotifications = await prisma.notification.deleteMany({
            where: {
                read: true,
                createdAt: { lt: sevenDaysAgo }
            }
        });

        // --- 3. Cleanup Old Cancelled Transactions ---
        const deletedTransactions = await prisma.transaction.deleteMany({
            where: {
                status: 'cancelled',
                updatedAt: { lt: thirtyDaysAgo }
            }
        });

        // --- 4. Cleanup Soft-Deleted Products' Images ---
        // Instead of hard-deleting the Product row (which would force us to delete Transactions
        // and therefore destroy user Ratings!), we will KEEP the database row but delete the physically
        // stored images to save server space.

        const oldDeletedProducts = await prisma.product.findMany({
            where: {
                deleted: true,
                updatedAt: { lt: thirtyDaysAgo },
                images: { not: "[]" } // Only process those that still have images
            }
        });

        let productsWipedCount = 0;

        for (const product of oldDeletedProducts) {
            if (product.images && product.images !== "[]") {
                try {
                    const imagesArray = JSON.parse(product.images);
                    for (const imagePath of imagesArray) {
                        deleteFile(imagePath);
                        filesDeleted++;
                    }

                    // Update database to reflect deleted images
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { images: "[]" }
                    });

                    productsWipedCount++;
                } catch (e) {
                    console.error(`[Auto Cleanup] Failed to wipe images for product ${product.id}:`, e);
                }
            }
        }

        console.log(`[Auto Cleanup] Summary:`);
        console.log(`- Messages: ${deletedMessages.count}`);
        console.log(`- Notifications: ${deletedNotifications.count}`);
        console.log(`- Transactions (Cancelled): ${deletedTransactions.count}`);
        console.log(`- Products (Images Wiped > 30d): ${productsWipedCount}`);
        console.log(`- Files Removed: ${filesDeleted}`);

        return {
            messagesDeleted: deletedMessages.count,
            notificationsDeleted: deletedNotifications.count,
            transactionsDeleted: deletedTransactions.count,
            productsWiped: productsWipedCount,
            filesDeleted: filesDeleted
        };
    } catch (error) {
        console.error('[Auto Cleanup] Error:', error);
        throw error;
    }
};
