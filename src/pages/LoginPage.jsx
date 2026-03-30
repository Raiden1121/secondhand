import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, IdCard } from 'lucide-react';
import pineLan from '../assets/pineLan.webp';
import { useTranslation } from 'react-i18next';
import { colleges } from '../data/mock';

const LoginPage = ({ onLogin, onBack }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('external'); // 'external' or 'password'
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login and Register form
    const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle Forgot Password flow
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false); // Toggle Registration success view

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
        let value = e.target.value;
        if (e.target.name === 'studentId') {
            value = value.replace(/\D/g, ''); // 僅保留數字
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isForgotPassword) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || '重設密碼請求失敗');
                }

                setForgotPasswordSuccess(true);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

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

            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '操作失敗');
            }

            if (isRegistering) {
                // Do not log in immediately, show verification instructions
                setRegisterSuccess(true);
                return;
            }

            // 儲存 token 到 localStorage (僅對於一般登入)
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
                    {isForgotPassword ? t('auth.reset_password', { defaultValue: '重設密碼' }) : isRegistering ? t('auth.register', { defaultValue: '註冊帳號' }) : t('auth.login', { defaultValue: '登入' })}
                </h2>

                {/* Tabs */}
                {!isRegistering && !isForgotPassword && (
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${activeTab === 'external'
                                ? 'text-pine-800'
                                : 'text-gray-400 hover:text-pine-600'
                                }`}
                            onClick={() => setActiveTab('external')}
                        >
                            {t('auth.ncu_login', { defaultValue: '校園帳號登入' })}
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
                            {t('auth.external_login', { defaultValue: '外部帳號登入' })}
                            {activeTab === 'password' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pine-800 rounded-t-full"></div>
                            )}
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="min-h-[300px]">
                    {!isRegistering && !isForgotPassword && activeTab === 'external' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-pine-600 text-center mb-4">
                                {t('auth.ncu_hint', { defaultValue: '中央大學學生請使用 Portal 帳號登入' })}
                            </p>
                            <button
                                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/portal`}
                                className="w-full py-3.5 px-6 bg-[#007EA8] hover:bg-[#006A8E] text-white rounded-xl font-medium shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group"
                            >
                                <span className="text-lg">{t('auth.portal_button', { defaultValue: '中央大學 PORTAL' })}</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="text-xs text-gray-400 mt-8 text-center">
                                {t('auth.portal_desc', { defaultValue: '透過 Portal 認證您的學生身分，安全、快速、無需額外註冊' })}
                            </div>
                        </div>
                    )}

                    {(!isRegistering && !isForgotPassword && activeTab === 'password') && (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.id_email', { defaultValue: '學號 / Email' })}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder={t('auth.id_placeholder', { defaultValue: '輸入您的 學號 或 Email' })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.password', { defaultValue: '密碼' })}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder={t('auth.password_placeholder', { defaultValue: '輸入密碼' })}
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
                                    {t('auth.remember_me', { defaultValue: '記住我' })}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        setIsForgotPassword(true);
                                    }}
                                    className="text-pine-600 hover:text-pine-800 font-medium hover:underline"
                                >
                                    {t('auth.forgot_password', { defaultValue: '忘記密碼？' })}
                                </button>
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
                                {loading ? t('auth.logging_in', { defaultValue: '登入中...' }) : t('auth.login', { defaultValue: '登入' })}
                            </button>

                            <div className="pt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(true)}
                                    className="text-pine-600 hover:text-pine-800 font-medium hover:underline text-sm"
                                >
                                    {t('auth.register_link', { defaultValue: '註冊新帳號' })}
                                </button>

                            </div>
                        </form>
                    )}

                    {isForgotPassword && (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                            {forgotPasswordSuccess ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-xl font-medium text-pine-900">{t('auth.reset_sent_title', { defaultValue: '信件已寄出' })}</h3>
                                    <p className="text-pine-600 text-sm leading-relaxed">
                                        {t('auth.reset_sent_desc', { defaultValue: '如果此信箱存在於系統中，我們已經將密碼重設連結寄到您的信箱（為了測試，請查看後端終端機 Console）。' })}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setForgotPasswordSuccess(false);
                                            setFormData({ ...formData, email: '' });
                                        }}
                                        className="w-full py-3.5 bg-pine-100 hover:bg-pine-200 text-pine-800 rounded-xl font-medium transition-all mt-4"
                                    >
                                        {t('auth.back_to_login', { defaultValue: '返回登入' })}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-pine-600 text-sm text-center mb-6">
                                        {t('auth.reset_prompt', { defaultValue: '請輸入您註冊時使用的電子郵件，我們將發送密碼重設連結給您。' })}
                                    </p>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-pine-700 ml-1">Email</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder={t('auth.id_placeholder', { defaultValue: '輸入您的信箱' })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                                value={formData.email}
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
                                        disabled={loading || !formData.email}
                                        className="w-full py-3.5 bg-pine-800 hover:bg-pine-900 text-white rounded-xl font-medium shadow-lg shadow-pine-900/10 transition-all hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? t('auth.sending', { defaultValue: '發送中...' }) : t('auth.reset_password', { defaultValue: '發送重設連結' })}
                                    </button>

                                    <div className="pt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(false)}
                                            className="text-gray-500 hover:text-pine-800 text-sm"
                                        >
                                            {t('auth.cancel', { defaultValue: '取消並返回' })}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}

                    {isRegistering && (
                        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            {registerSuccess ? (
                                <div className="text-center space-y-4 py-8">
                                    <div className="w-16 h-16 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-xl font-medium text-pine-900">{t('auth.register_step_title', { defaultValue: '註冊幾乎完成了！' })}</h3>
                                    <p className="text-pine-600 text-sm leading-relaxed">
                                        {t('auth.register_step_desc', { defaultValue: '一封驗證信件已經發送至您的信箱：' })}<br />
                                        <span className="font-semibold">{formData.email}</span><br /><br />
                                        {t('auth.register_step_hint', { defaultValue: '請點擊信件內的連結來完成您的帳號開通。' })}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegistering(false);
                                            setRegisterSuccess(false);
                                            setFormData({
                                                email: '',
                                                password: '',
                                                name: '',
                                                studentId: '',
                                                department: '',
                                                phone: '',
                                                gender: ''
                                            });
                                        }}
                                        className="w-full py-3.5 bg-pine-100 hover:bg-pine-200 text-pine-800 rounded-xl font-medium transition-all mt-4"
                                    >
                                        {t('auth.back_to_login', { defaultValue: '返回登入' })}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.name', { defaultValue: '姓名' })}</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder={t('auth.name_placeholder', { defaultValue: '您的稱呼' })}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.student_id', { defaultValue: '學號' })}</label>
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
                                                pattern="\d*"
                                                inputMode="numeric"
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
                                        <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.dept', { defaultValue: '系所' })}</label>
                                        <div className="relative">
                                            <select
                                                name="department"
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900 appearance-none"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">{t('auth.select_dept', { defaultValue: '選擇系所' })}</option>
                                                {colleges.filter(college => college.name !== '全部學院' && college.name !== '其他' && college.name !== '其他分類').map((college, idx) => (
                                                    <optgroup key={`optgroup-${idx}`} label={t(`colleges.${college.name}`, { defaultValue: college.name })}>
                                                        {college.departments.map((dept, dIdx) => (
                                                            <option key={`opt-${idx}-${dIdx}`} value={dept}>
                                                                {t(`departments.${dept}`, { defaultValue: dept })}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                                {colleges.find(c => c.name === '其他' || c.name === '其他分類')?.departments.map((dept, dIdx) => (
                                                    <option key={`other-${dIdx}`} value={dept}>
                                                        {t(`departments.${dept}`, { defaultValue: dept })}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pine-400 pointer-events-none">▼</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.phone', { defaultValue: '電話' })}</label>
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
                                            <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.gender', { defaultValue: '性別' })}</label>
                                            <select
                                                name="gender"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 outline-none transition-all text-pine-900"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">{t('auth.select', { defaultValue: '選擇' })}</option>
                                                <option value="male">{t('auth.male', { defaultValue: '男' })}</option>
                                                <option value="female">{t('auth.female', { defaultValue: '女' })}</option>
                                                <option value="other">{t('auth.other', { defaultValue: '其他' })}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-pine-700 ml-1">{t('auth.password', { defaultValue: '密碼' })}</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pine-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                placeholder={t('auth.password_placeholder', { defaultValue: '設定密碼' })}
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
                                        {loading ? t('auth.registering', { defaultValue: '註冊中...' }) : t('auth.confirm_register', { defaultValue: '確認註冊' })}
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
                                            {t('auth.back_to_login', { defaultValue: '返回登入' })}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
