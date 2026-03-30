import React from 'react';
import { Home, MessageCircle, Plus, Bell, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileNav = ({ currentPage, setCurrentPage, unreadCount, chatUnreadCount }) => {
    const { t } = useTranslation();
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pine-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
            <div className="flex justify-around py-3">
                <button
                    onClick={() => setCurrentPage('home')}
                    className={`flex flex-col items-center gap-1 transition ${currentPage === 'home' ? 'text-pine-800' : 'text-pine-400'
                        }`}
                >
                    <Home size={24} />
                    <span className="text-xs">{t('nav.home')}</span>
                </button>
                <button
                    onClick={() => setCurrentPage('chat')}
                    className={`flex flex-col items-center gap-1 relative transition ${currentPage === 'chat' ? 'text-pine-800' : 'text-pine-400'
                        }`}
                >
                    <MessageCircle size={24} />
                    <span className="text-xs">{t('nav.chat')}</span>
                    <span className="absolute top-0 right-4 w-4 h-4 bg-stone-800 text-white text-xs rounded-full flex items-center justify-center">
                        2
                    </span>
                </button>
                <button
                    onClick={() => setCurrentPage('post')}
                    className="flex flex-col items-center gap-1 -mt-6"
                >
                    <div className="w-14 h-14 bg-pine-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pine-700 transition ring-4 ring-white">
                        <Plus size={28} />
                    </div>
                    <span className="text-xs text-pine-600 mt-1 font-medium">{t('nav.post')}</span>
                </button>
                <button
                    onClick={() => setCurrentPage('chat')}
                    className={`flex flex-col items-center justify-center w-full h-full relative ${currentPage === 'chat' ? 'text-pine-900' : 'text-pine-400 hover:text-pine-600'
                        }`}
                >
                    <MessageCircle size={24} />
                    <span className="text-[10px] mt-1 font-medium">{t('nav.chat')}</span>
                    {chatUnreadCount > 0 && (
                        <span className="absolute top-1 right-5 w-4 h-4 bg-stone-800 text-white text-[10px] rounded-full flex items-center justify-center">
                            {chatUnreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setCurrentPage('notifications')}
                    className={`flex flex-col items-center justify-center w-full h-full relative ${currentPage === 'notifications' ? 'text-pine-900' : 'text-pine-400 hover:text-pine-600'
                        }`}
                >
                    <Bell size={24} />
                    <span className="text-[10px] mt-1 font-medium">{t('nav.notifications')}</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-5 w-4 h-4 bg-stone-800 text-white text-[10px] rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setCurrentPage('profile')}
                    className={`flex flex-col items-center gap-1 transition ${currentPage === 'profile' ? 'text-pine-800' : 'text-pine-400'
                        }`}
                >
                    <User size={24} />
                    <span className="text-xs">{t('nav.profile')}</span>
                </button>
            </div>
        </div>
    );
};

export default MobileNav;
