import prisma from '../lib/prisma.js';

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: { id: userId }
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true, avatar: true, department: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for frontend with unread count
        const formattedChats = await Promise.all(chats.map(async chat => {
            const otherUser = chat.participants.find(p => p.id !== userId) || { name: 'Unknown', avatar: null };
            const lastMsg = chat.messages[0];

            // Count unread messages
            const unreadCount = await prisma.message.count({
                where: {
                    chatId: chat.id,
                    read: false,
                    senderId: { not: userId }
                }
            });

            return {
                id: chat.id,
                name: otherUser.name || 'Unknown',
                avatar: otherUser.avatar,
                department: otherUser.department,
                lastMsg: lastMsg ? lastMsg.content : '',
                time: lastMsg ? lastMsg.createdAt : chat.createdAt,
                unread: unreadCount
            };
        }));

        res.json(formattedChats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await prisma.message.findMany({
            where: { chatId: parseInt(chatId) },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                product: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        images: true,
                        status: true
                    }
                }
            }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const initiateChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ message: 'Target user ID is required' });
        }

        const targetId = parseInt(targetUserId);

        if (userId === targetId) {
            return res.status(400).json({ message: 'Cannot chat with yourself' });
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for existing chat between these two users
        const existingChat = await prisma.chat.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: targetId } } }
                ]
            },
            include: {
                participants: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        if (existingChat) {
            return res.json(existingChat);
        }

        // Create new chat
        const newChat = await prisma.chat.create({
            data: {
                participants: {
                    connect: [
                        { id: userId },
                        { id: targetId }
                    ]
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;
        const { content, productId } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // At least one of content, image, or productId must be provided
        if ((!content || !content.trim()) && !image && !productId) {
            return res.status(400).json({ message: 'Message content, image, or product is required' });
        }

        const chatIdInt = parseInt(chatId);

        // Verify user is participant of this chat
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatIdInt,
                participants: { some: { id: userId } }
            }
        });

        if (!chat) {
            return res.status(403).json({ message: 'Not authorized to send message to this chat' });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                content: content ? content.trim() : null,
                image: image,
                productId: productId ? parseInt(productId) : null,
                chatId: chatIdInt,
                senderId: userId,
                read: false
            },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
                product: productId ? {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        images: true,
                        status: true
                    }
                } : false
            }
        });

        // Update chat's updatedAt
        await prisma.chat.update({
            where: { id: chatIdInt },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;
        const chatIdInt = parseInt(chatId);

        // Verify user is participant
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatIdInt,
                participants: { some: { id: userId } }
            }
        });

        if (!chat) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Mark all messages from other users as read
        await prisma.message.updateMany({
            where: {
                chatId: chatIdInt,
                senderId: { not: userId },
                read: false
            },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;
        const chatIdInt = parseInt(chatId);

        // Verify user is participant
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatIdInt,
                participants: { some: { id: userId } }
            }
        });

        if (!chat) {
            return res.status(403).json({ message: 'Not authorized to delete this chat' });
        }

        // Delete all messages in the chat first
        await prisma.message.deleteMany({
            where: { chatId: chatIdInt }
        });

        // Delete the chat
        await prisma.chat.delete({
            where: { id: chatIdInt }
        });

        res.json({ success: true, message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
