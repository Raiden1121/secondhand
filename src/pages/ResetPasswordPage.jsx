import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import pineLan from '../assets/pineLan.webp';

const ResetPasswordPage = ({ resetToken, onPasswordResetSuccess, onBackToLogin }) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validate token exists on mount
    useEffect(() => {
        if (!resetToken) {
            setError('無效的重設連結');
        }
    }, [resetToken]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword.length < 6) {
            setError('密碼長度必須至少為 6 個字元');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('兩次輸入的密碼不一致');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '密碼重設失敗');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-forest-50/30 -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-forest-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cream-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>

            <img
                src={pineLan}
                alt="Decoration"
                className="absolute bottom-10 right-10 w-32 opacity-20 hidden md:block -z-10 rotate-12"
            />

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pine-600 to-forest-500"></div>

                <div className="absolute top-4 left-4">
                    <button
                        onClick={onBackToLogin}
                        className="text-pine-400 hover:text-pine-600 transition-colors p-2"
                        title="返回登入"
                    >
                        <ArrowRight className="rotate-180" size={20} />
                    </button>
                </div>

                <h2 className="text-3xl font-light text-center text-pine-900 mb-8 tracking-wide">
                    設定新密碼
                </h2>

                <div className="min-h-[300px]">
                    {success ? (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-forest-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-medium text-pine-900">密碼重設成功</h3>
                            <p className="text-pine-600 text-sm leading-relaxed">
                                您現在可以使用新密碼登入您的帳戶。
                            </p>
                            <button
                                onClick={onPasswordResetSuccess}
                                className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-8"
                            >
                                立即登入
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-pine-600 text-sm text-center mb-6">
                                請輸入您的新密碼，並再次確認。
                            </p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">新密碼</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="輸入新密碼 (至少 6 個字元)"
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pine-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">確認新密碼</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="再次輸入新密碼"
                                        required
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pine-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !resetToken}
                                className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '更新中...' : '確認修改'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
