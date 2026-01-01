import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, IdCard } from 'lucide-react';
import pineLan from '../assets/pineLan.png';

const LoginPage = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState('external'); // 'external' or 'password'
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login and Register form

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        studentId: '',
        department: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically call an API to login/register
        // For MVP/Demo, we just call onLogin()
        onLogin();
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Background Decor - Keeping the style consistent */}
            <div className="absolute top-0 left-0 w-full h-full bg-forest-50/30 -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-forest-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cream-100/40 rounded-full blur-3xl -z-10 animate-pulse"></div>

            {/* Mascot (Optional, positioned decoratively) */}
            <img
                src={pineLan}
                alt="Decoration"
                className="absolute bottom-10 right-10 w-32 opacity-20 hidden md:block -z-10 rotate-12"
            />

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10 w-full max-w-md relative overflow-hidden">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pine-600 to-forest-500"></div>

                <div className="absolute top-4 left-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="text-pine-400 hover:text-pine-600 transition-colors p-2"
                        title="返回首頁"
                    >
                        <ArrowRight className="rotate-180" size={20} />
                    </button>
                </div>

                <h2 className="text-3xl font-light text-center text-pine-900 mb-8 tracking-wide">
                    {isRegistering ? '註冊帳號' : '登入'}
                </h2>

                {/* Tabs */}
                {!isRegistering && (
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'external'
                                ? 'text-pine-800'
                                : 'text-gray-400 hover:text-pine-600'
                                }`}
                            onClick={() => setActiveTab('external')}
                        >
                            外部登入
                            {activeTab === 'external' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pine-800 rounded-t-full"></div>
                            )}
                        </button>
                        <button
                            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'password'
                                ? 'text-pine-800'
                                : 'text-gray-400 hover:text-pine-600'
                                }`}
                            onClick={() => setActiveTab('password')}
                        >
                            密碼登入
                            {activeTab === 'password' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pine-800 rounded-t-full"></div>
                            )}
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="min-h-[300px]">
                    {!isRegistering && activeTab === 'external' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-pine-600 text-center mb-4">
                                中央大學學生請使用 Portal 帳號登入
                            </p>
                            <button
                                onClick={onLogin}
                                className="w-full py-3.5 px-6 bg-[#007EA8] hover:bg-[#006A8E] text-white rounded-xl font-medium shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group"
                            >
                                <span className="text-lg">中央大學 PORTAL</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="text-xs text-gray-400 mt-8 text-center">
                                透過 Portal 認證您的學生身分<br />安全、快速、无需額外註冊
                            </div>
                        </div>
                    )}

                    {(!isRegistering && activeTab === 'password') && (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">帳號 / Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="輸入您的 Email"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">密碼</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="輸入密碼"
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.password}
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

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-pine-700">
                                    <input type="checkbox" className="rounded border-gray-300 text-pine-600 focus:ring-pine-500" />
                                    記住我
                                </label>
                                <a href="#" className="text-pine-600 hover:text-pine-800 font-medium hover:underline">
                                    忘記密碼？
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-4"
                            >
                                登入
                            </button>

                            <div className="pt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(true)}
                                    className="text-pine-600 hover:text-pine-800 font-medium hover:underline text-sm"
                                >
                                    註冊新帳號
                                </button>

                            </div>
                        </form>
                    )}

                    {isRegistering && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">姓名</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="您的稱呼"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">學號</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <IdCard size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="studentId"
                                        placeholder="114000000"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="example@ncu.edu.tw"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">密碼</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="設定密碼"
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-6"
                            >
                                確認註冊
                            </button>

                            <div className="pt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(false)}
                                    className="text-gray-500 hover:text-pine-800 text-sm"
                                >
                                    返回登入
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
