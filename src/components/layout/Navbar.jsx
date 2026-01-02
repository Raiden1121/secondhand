import React from 'react';
import { Home, MessageCircle, Plus, Bell, User } from 'lucide-react';
import pineLogo from '../../assets/pineLogo.png';

const Navbar = ({ currentPage, setCurrentPage, unreadCount, chatUnreadCount, isLoggedIn, onLogin }) => {
    return (
        <div className="bg-white/80 backdrop-blur-md border-b border-pine-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('landing')}>
                        <div className="text-2xl">
                            <img src={pineLogo} alt="Logo" className="w-16 h-16 object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-pine-800 tracking-wide">松手傳遞</h1>
                            <p className="text-xs text-pine-500 font-semibold hidden md:block">中央大學二手買賣</p>
                        </div>
                    </div>

                    {/* 桌面版導航 */}
                    {isLoggedIn ? (
                        <div className="hidden md:flex items-center gap-6">
                            <button
                                onClick={() => setCurrentPage('home')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${currentPage === 'home' ? 'bg-forest-100 text-forest-900 font-medium' : 'text-pine-600 hover:text-pine-800 hover:bg-pine-50'
                                    }`}
                            >
                                <Home size={20} />
                                <span className="text-sm">首頁</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage('post')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-pine-800 text-white rounded-full hover:bg-pine-700 transition shadow-sm hover:shadow-md"
                            >
                                <Plus size={20} />
                                <span className="text-sm font-medium">分享</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage('chat')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition relative ${currentPage === 'chat' ? 'bg-forest-100 text-forest-900 font-medium' : 'text-pine-600 hover:text-pine-800 hover:bg-pine-50'
                                    }`}
                            >
                                <MessageCircle size={20} />
                                <span className="text-sm">對話</span>
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
                                <span className="text-sm">通知</span>
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
                                <span className="text-sm">我的</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setCurrentPage('login')}
                            className="px-6 py-2 bg-pine-800 text-white rounded-full font-medium hover:bg-pine-700 transition shadow-sm hover:shadow-md"
                        >
                            登入 / 註冊
                        </button>
                    )}

                    {/* 手機版右上角 */}
                    <div className="flex md:hidden items-center gap-2">
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
