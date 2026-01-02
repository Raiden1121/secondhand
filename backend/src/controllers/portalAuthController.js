import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const CLIENT_ID = process.env.PORTAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PORTAL_CLIENT_SECRET;
const REDIRECT_URI = process.env.PORTAL_REDIRECT_URI;
// Use hardcoded http://localhost:5173 for locally running frontend if env not set
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const initiatePortalAuth = (req, res) => {
    // Scopes requested by user
    const scopes = ['identifier', 'chinese-name', 'student-id', 'email', 'mobile-phone'];

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        scope: scopes.join(' '),
        redirect_uri: REDIRECT_URI,
    });

    const authUrl = `https://portal.ncu.edu.tw/oauth2/authorization?${params.toString()}`;
    res.redirect(authUrl);
};

export const handlePortalCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    try {
        // 1. Exchange code for access token
        const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

        const tokenResponse = await fetch('https://portal.ncu.edu.tw/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Portal Token Error:', tokenData);
            throw new Error('Failed to exchange token');
        }

        const accessToken = tokenData.access_token;

        // 2. Get user profile
        const userResponse = await fetch('https://portal.ncu.edu.tw/apis/oauth/v1/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            console.error('Portal User Info Error:', userData);
            throw new Error('Failed to get user info');
        }

        // userData example: { identifier, chineseName, studentId, email, ... }

        // 3. Find or create user
        // We use studentId or email to identify user
        const email = userData.email || `${userData.studentId}@cc.ncu.edu.tw`; // Fallback email

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { studentId: userData.studentId },
                    { email: email }
                ]
            }
        });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name: userData.chineseName,
                    email: email,
                    studentId: userData.studentId,
                    // Use identifier (Portal ID) or just default avatar
                    avatar: '👤',
                    // Set a random password since they use OAuth
                    password: crypto.randomBytes(16).toString('hex'),
                    department: null // Need to map or leave empty
                }
            });
        } else {
            // Update existing user info if needed
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: userData.chineseName,
                    studentId: userData.studentId
                    // Don't update email blindly if checking by OR
                }
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 5. Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/?token=${token}`);

    } catch (error) {
        console.error('OAuth Callback Error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
};
