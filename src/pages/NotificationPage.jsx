import React from 'react';
import { CheckCheck } from 'lucide-react';

const NotificationPage = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => (
    <div className="px-4 space-y-4">
        <div className="flex items-center justify-between py-6">
            <h2 className="text-2xl md:text-3xl font-light text-pine-900 tracking-wide">通知</h2>
            <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-sm text-pine-600 hover:text-pine-800 hover:bg-pine-100/50 px-3 py-1.5 rounded-full transition"
            >
                <CheckCheck size={16} />
                全部已讀
            </button>
        </div>
        <div className="space-y-3">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    onClick={() => onMarkAsRead(notification.id)}
                    className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl hover:shadow-md transition cursor-pointer border border-pine-50 hover:border-pine-100 ${!notification.read ? 'border-l-4 border-l-pine-800 bg-white' : 'opacity-75'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'message' ? 'bg-blue-100' :
                            notification.type === 'like' ? 'bg-red-100' :
                                notification.type === 'review' ? 'bg-amber-100/50' :
                                    'bg-cream-100'
                            }`}>
                            {notification.type === 'message' ? '💬' :
                                notification.type === 'like' ? '❤️' :
                                    notification.type === 'review' ? '⭐' :
                                        '📢'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-medium mb-1 ${!notification.read ? 'text-pine-900' : 'text-pine-600'}`}>
                                {notification.title}
                            </h3>
                            <p className="text-sm text-pine-600 mb-2">{notification.content}</p>
                            <span className="text-xs text-pine-400">{notification.time}</span>
                        </div>
                        {!notification.read && (
                            <div className="w-2 h-2 bg-pine-800 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                    </div>
                </div>
            ))}
            {notifications.length === 0 && (
                <div className="text-center py-20 text-pine-400">
                    目前沒有新通知
                </div>
            )}
        </div>
    </div>
);

export default NotificationPage;
