import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP credentials not found in .env, falling back to mock email service.');
            // Fallback to mock service
            const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetLink = `${clientUrl}/#reset-password=${resetToken}`;
            console.log('\n======================================================');
            console.log(`[MAIL SERVICE SIMULATION] Sending password reset email`);
            console.log(`To: ${email}`);
            console.log(`Reset Link: ${resetLink}`);
            console.log('======================================================\n');
            return new Promise((resolve) => setTimeout(resolve, 500));
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${clientUrl}/#reset-password=${resetToken}`;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: '【中央二手拍】密碼重設請求',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2F4F4F;">密碼重設請求</h2>
                    <p>我們收到了您要求重設密碼的請求。請點擊下方的按鈕來設定新密碼：</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #2F4F4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            重設密碼
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">這條連結將在 1 小時後失效。如果您沒有發送此請求，請忽略這封信件。</p>
                    <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px;">
                        如果按鈕無法點擊，您也可以複製以下連結貼上至瀏覽器：<br>
                        <a href="${resetLink}" style="color: #2F4F4F;">${resetLink}</a>
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Success] Password reset email sent to ${email}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send email to ${email}:`, error);
        throw error;
    }
};

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP credentials not found in .env, falling back to mock email service.');
            const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationLink = `${clientUrl}/#verify-email=${verificationToken}`;
            console.log('\n======================================================');
            console.log(`[MAIL SERVICE SIMULATION] Sending verification email`);
            console.log(`To: ${email}`);
            console.log(`Verification Link: ${verificationLink}`);
            console.log('======================================================\n');
            return new Promise((resolve) => setTimeout(resolve, 500));
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${clientUrl}/#verify-email=${verificationToken}`;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: '【中央二手拍】信箱驗證',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2F4F4F;">歡迎加入中央二手拍！</h2>
                    <p>感謝您的註冊。請點擊下方按鈕來驗證您的電子郵件信箱並開通帳號：</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #2F4F4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            驗證信箱
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">如果您沒有註冊本網站，請忽略此信件。</p>
                    <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px;">
                        如果按鈕無法點擊，您也可以複製以下連結貼上至瀏覽器：<br>
                        <a href="${verificationLink}" style="color: #2F4F4F;">${verificationLink}</a>
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Success] Verification email sent to ${email}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send email to ${email}:`, error);
        throw error;
    }
};
