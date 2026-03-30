import React from 'react';
import { Home, MessageCircle, Plus, Bell, User, Globe } from 'lucide-react';
import pineLogo from '../../assets/pineLogo.webp';
import { useTranslation } from 'react-i18next';

const Navbar = ({ currentPage, setCurrentPage, unreadCount, chatUnreadCount, isLoggedIn, onLogin }) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language.startsWith('en') ? 'zh-TW' : 'en');
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border-b border-pine-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('landing')}>
                        <div className="text-2xl">
                            <img src={pineLogo} alt="Logo" className="w-16 h-16 object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-pine-800 tracking-wide">{t('nav.brand')}</h1>
                            <p className="text-xs text-pine-500 font-semibold hidden md:block">{t('nav.ncu_marketplace')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 桌面版導航 */}
                        {isLoggedIn ? (
                            <div className="hidden md:flex items-center gap-6">
                                <button
                                    onClick={() => setCurrentPage('home')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${currentPage === 'home' ? 'bg-forest-100 text-forest-900 font-medium' : 'text-pine-600 hover:text-pine-800 hover:bg-pine-50'
                                        }`}
                                >
                                    <Home size={20} />
                                    <span className="text-sm">{t('nav.home')}</span>
                                </button>
                                <button
                                    onClick={() => setCurrentPage('post')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-pine-800 text-white rounded-full hover:bg-pine-700 transition shadow-sm hover:shadow-md"
                                >
                                    <Plus size={20} />
                                    <span className="text-sm font-medium">{t('nav.post')}</span>
                                </button>
                                <button
                                    onClick={() => setCurrentPage('chat')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition relative ${currentPage === 'chat' ? 'bg-forest-100 text-forest-900 font-medium' : 'text-pine-600 hover:text-pine-800 hover:bg-pine-50'
                                        }`}
                                >
                                    <MessageCircle size={20} />
                                    <span className="text-sm">{t('nav.chat')}</span>
                                    {chatUnreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-800 text-white text-xs rounded-full flex items-center justify-center">
                                            {chatUnreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setCurrentPage('notifications')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition relative ${currentPage === 'notifications' ? 'bg-forest-100 text-forest-900 font-medium' : 'text-pine-600 hover:text-pine-800 hover:bg-pine-50'
                                        }`}
                                >
                                    <Bell size={20} />
                                    <span className="text-sm">{t('nav.notifications')}</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-800 text-white text-xs rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setCurrentPage('profile')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${currentPage === 'profile' ? 'bg-forest-100 text-forest-900 font-medium' : 'text-pine-600 hover:text-pine-800 hover:bg-pine-50'
                                        }`}
                                >
                                    <User size={20} />
                                    <span className="text-sm">{t('nav.profile')}</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setCurrentPage('login')}
                                className="hidden md:block px-6 py-2 bg-pine-800 text-white rounded-full font-medium hover:bg-pine-700 transition shadow-sm hover:shadow-md"
                            >
                                {t('nav.login_signup')}
                            </button>
                        )}

                        {/* 語言切換按鈕 - 桌機版 */}
                        <button
                            onClick={toggleLanguage}
                            className="hidden md:flex items-center gap-2 px-3 py-2 text-pine-600 hover:text-pine-800 hover:bg-pine-50 rounded-full transition"
                            title="Switch Language"
                        >
                            <Globe size={20} />
                            <span className="text-sm font-medium">{i18n.language?.startsWith('en') ? 'EN' : '中'}</span>
                        </button>
                    </div>

                    {/* 手機版右上角 */}
                    <div className="flex md:hidden items-center gap-3">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 px-2 py-1.5 text-pine-600 hover:text-pine-800 rounded-full transition bg-white/50"
                        >
                            <Globe size={18} />
                            <span className="text-xs font-medium">{i18n.language?.startsWith('en') ? 'EN' : '中'}</span>
                        </button>
                        <div className="text-xs text-pine-700 bg-pine-100 px-3 py-1.5 rounded-full font-medium">
                            NCU
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
