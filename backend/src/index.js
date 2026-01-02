import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for dev, restrict in prod
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notification.js';
import favoriteRoutes from './routes/favorite.js';
import reportRoutes from './routes/report.js';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reports', reportRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_chat', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.id} joined chat_${chatId}`);
    });

    socket.on('send_message', async (data) => {
        // data: { chatId, senderId, content }
        // Save to DB (optional: can be done via API, but socket is faster for realtime)
        // For now, assume message saved via API and this event just relays it
        io.to(`chat_${data.chatId}`).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Secondhand Marketplace API is running');
});

// Start Server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Test DB Connection
prisma.$connect()
    .then(() => console.log('Connected to Database'))
    .catch((err) => console.error('DB Connection Error:', err));
