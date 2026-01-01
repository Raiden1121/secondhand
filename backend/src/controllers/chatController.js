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
                    select: { id: true, name: true, avatar: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Format for frontend
        const formattedChats = chats.map(chat => {
            const otherUser = chat.participants.find(p => p.id !== userId);
            const lastMsg = chat.messages[0];
            // Count unread (naive approach, better to do aggregation in DB)
            // For now, let's just return raw data and let frontend or socket handle realcounts if complex
            return {
                id: chat.id,
                name: otherUser.name,
                avatar: otherUser.avatar,
                lastMsg: lastMsg ? lastMsg.content : '',
                time: lastMsg ? lastMsg.createdAt : '',
                // unread: ... (Need to count messages where chatId=chat.id AND read=false AND senderId!=userId)
            };
        });

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
                sender: { select: { id: true, name: true, avatar: true } }
            }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
