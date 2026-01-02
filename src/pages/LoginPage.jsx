import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, IdCard } from 'lucide-react';
import pineLan from '../assets/pineLan.png';

const LoginPage = ({ onLogin, onBack }) => {
    const [activeTab, setActiveTab] = useState('external'); // 'external' or 'password'
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login and Register form

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        studentId: '',
        department: '',
        phone: '',
        gender: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
            const body = isRegistering
                ? {
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    studentId: formData.studentId,
                    department: formData.department,
                    phone: formData.phone,
                    gender: formData.gender
                }
                : { email: formData.email, password: formData.password };

            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '登入失敗');
            }

            // 儲存 token 到 localStorage
            localStorage.setItem('token', data.token);
            // 傳遞使用者資料給 App
            onLogin(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                        onClick={onBack}
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
                                onClick={() => window.location.href = 'http://localhost:3000/api/auth/portal'}
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
                                <label className="text-sm font-medium text-pine-700 ml-1">學號 / Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="輸入您的 學號 或 Email"
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

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '登入中...' : '登入'}
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
                                <label className="text-sm font-medium text-pine-700 ml-1">系所</label>
                                <div className="relative">
                                    <select
                                        name="department"
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900 appearance-none"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">選擇系所</option>
                                        <option value="資工系">資工系</option>
                                        <option value="資管系">資管系</option>
                                        <option value="電機系">電機系</option>
                                        <option value="數學系">數學系</option>
                                        <option value="企管系">企管系</option>
                                        <option value="經濟系">經濟系</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pine-400 pointer-events-none">▼</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-pine-700 ml-1">電話</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="0912345678"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-pine-700 ml-1">性別</label>
                                    <select
                                        name="gender"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">選擇</option>
                                        <option value="male">男</option>
                                        <option value="female">女</option>
                                        <option value="other">其他</option>
                                    </select>
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

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '註冊中...' : '確認註冊'}
                            </button>

                            <div className="pt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            email: '',
                                            password: '',
                                            name: '',
                                            studentId: '',
                                            department: '',
                                            phone: '',
                                            gender: ''
                                        });
                                        setError('');
                                        setIsRegistering(false);
                                    }}
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
