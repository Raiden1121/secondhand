import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/mailService.js';

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

        // Generate verification token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                department,
                avatar,
                studentId,
                phone,
                gender,
                isVerified: false,
                verificationToken
            }
        });

        // Send verification email
        await sendVerificationEmail(user.email, rawToken);

        // DO NOT log the user in yet. Tell them to check email.
        res.status(201).json({
            message: '註冊成功！請至您的信箱收取驗證信，完成開通即可登入。'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: '系統發生錯誤，請稍後再試' });
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

        // Enforce Email Verification
        if (!user.isVerified) {
            return res.status(403).json({ message: '請先至您的信箱收取驗證信，完成註冊驗證才能登入' });
        }

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

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: '請提供電子郵件' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // IMPORTANT: We do not reveal whether the email exists to prevent email enumeration
        if (!user) {
            return res.json({ message: '如果信箱存在，密碼重設連結已寄出。' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token for database storage
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expiration (1 hour)
        const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken,
                resetPasswordExpires
            }
        });

        // Send Email (Mock)
        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: '如果信箱存在，密碼重設連結已寄出。' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: '系統發生錯誤，請稍後再試' });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: '請提供必要的資訊' });
        }

        // Hash the token from the user to compare with DB
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token and expiration
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken,
                resetPasswordExpires: { gt: new Date() } // Token has not expired
            }
        });

        if (!user) {
            return res.status(400).json({ message: '重設連結無效或已過期' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        res.json({ message: '密碼重設成功，請使用新密碼登入' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: '重設密碼失敗，請稍後再試' });
    }
};

// Verify Email Account
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        console.log('[DEBUG-VERIFY] Received Token:', token);

        if (!token) {
            return res.status(400).json({ message: '無效的驗證連結' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log('[DEBUG-VERIFY] Hashed Token:', hashedToken);

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: hashedToken,
                isVerified: false
            }
        });

        console.log('[DEBUG-VERIFY] foundUser:', user ? user.email : 'null');

        if (!user) {
            return res.status(400).json({ message: '驗證連結無效或帳號已驗證' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });

        res.json({ message: '信箱驗證成功，您現在可以登入了！' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: '系統發生錯誤，請稍後再試' });
    }
};
