import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
    try {
        const { email, password, name, department, avatar, studentId, phone, gender } = req.body;

        // Validation for required fields
        if (!email || !password || !name || !studentId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user exists (by email OR studentId)
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { studentId }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            if (existingUser.studentId === studentId) {
                return res.status(400).json({ message: 'Student ID already registered' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                department,
                avatar,
                studentId,
                phone,
                gender
            }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
                department: user.department,
                phone: user.phone,
                gender: user.gender,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                avatar: user.avatar,
                studentId: user.studentId,
                phone: user.phone,
                gender: user.gender
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                avatar: true,
                studentId: true,
                phone: true,
                gender: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, department, phone, gender } = req.body;

        const dataToUpdate = {
            name,
            department,
            phone,
            gender
        };

        if (req.file) {
            dataToUpdate.avatar = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                avatar: true,
                studentId: true,
                phone: true,
                gender: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                department: true,
                avatar: true,
                // Rating assumes there might be a reviews relation or aggregate, 
                // but since schema isn't fully known, we'll keep it simple for now or fetch if exists.
                // If rating is stored on user:
                // rating: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mock rating if not in DB yet, or simple aggregation if we had a review model
        // For now, returning basic profile
        res.json({
            ...user,
            rating: 4.8, // Default or mock
            reviewCount: 12 // Default or mock
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
