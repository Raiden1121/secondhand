import React, { useState, useEffect } from 'react';
import { MailCheck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import pineLan from '../assets/pineLan.png';

const verifiedTokens = new Set();

const VerifyEmailPage = ({ verificationToken, onVerified, onBackToLogin }) => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('正在驗證您的 Email...');

    useEffect(() => {
        const verify = async () => {
            if (verifiedTokens.has(verificationToken)) return;
            verifiedTokens.add(verificationToken);

            try {
                const response = await fetch('http://localhost:3000/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: verificationToken })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('信箱驗證成功！您現在可以開始使用中央二手拍了。');
                } else {
                    setStatus('error');
                    setMessage(data.message || '驗證失敗或連結已過期，請重新註冊或聯絡客服。');
                }
            } catch (err) {
                setStatus('error');
                setMessage('系統發生錯誤，無法連線至伺服器。');
            }
        };

        if (verificationToken) {
            verify();
        }
    }, [verificationToken]);

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-forest-50/30 -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-forest-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cream-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>

            <img
                src={pineLan}
                alt="Decoration"
                className="absolute bottom-10 right-10 w-32 opacity-20 hidden md:block -z-10 rotate-12"
            />

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10 w-full max-w-md relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pine-600 to-forest-500"></div>

                <div className="space-y-6 pt-4">
                    <div className="flex justify-center">
                        {status === 'verifying' && (
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                <MailCheck size={40} />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle2 size={40} />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <XCircle size={40} />
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-medium text-pine-900">
                        {status === 'verifying' ? '驗證中...' : status === 'success' ? '驗證成功' : '驗證失敗'}
                    </h2>

                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>

                    {status !== 'verifying' && (
                        <button
                            onClick={status === 'success' ? onVerified : onBackToLogin}
                            className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-8 flex items-center justify-center gap-2 group"
                        >
                            <span>返回登入頁面</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
