import React, { useState } from 'react';
import { CheckCheck, Check, X, ShoppingBag, Star, MessageCircle, AlertTriangle, Trash2, TreePine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotificationPage = ({ notifications, onMarkAsRead, onMarkAllAsRead, onConfirmPurchase, onCancelPurchase, onNavigateToRating, onDeleteNotification, onDeleteAllRead }) => {
    const { t } = useTranslation();
    const [processingIds, setProcessingIds] = useState({});
    const [sdgModalData, setSdgModalData] = useState(null);

    const handleConfirm = async (e, notification) => {
        e.stopPropagation();
        if (!notification.data) return;

        try {
            const data = JSON.parse(notification.data);
            setProcessingIds(prev => ({ ...prev, [notification.id]: 'confirming' }));
            const result = await onConfirmPurchase(data.transactionId);

            if (result && result.success) {
                onMarkAsRead(notification.id);
                if (result.carbonSaved && result.carbonSaved > 0) {
                    setSdgModalData({
                        carbon: result.carbonSaved.toFixed(2),
                        trees: (result.carbonSaved / 12).toFixed(2)
                    });
                }
            }
        } catch (error) {
            console.error('Error confirming purchase:', error);
        } finally {
            setProcessingIds(prev => ({ ...prev, [notification.id]: null }));
        }
    };

    const handleCancel = async (e, notification) => {
        e.stopPropagation();
        if (!notification.data) return;

        try {
            const data = JSON.parse(notification.data);
            setProcessingIds(prev => ({ ...prev, [notification.id]: 'cancelling' }));
            await onCancelPurchase(data.transactionId);
            onMarkAsRead(notification.id);
        } catch (error) {
            console.error('Error cancelling purchase:', error);
        } finally {
            setProcessingIds(prev => ({ ...prev, [notification.id]: null }));
        }
    };

    const handleRatingClick = (e, notification) => {
        e.stopPropagation();
        if (!notification.data) return;

        try {
            const data = JSON.parse(notification.data);
            
            if (data.carbonSaved && data.carbonSaved > 0) {
                // Show modal first, then go to rating
                setSdgModalData({
                    carbon: data.carbonSaved.toFixed(2),
                    trees: (data.carbonSaved / 12).toFixed(2),
                    onContinue: () => {
                        onNavigateToRating(data.transactionId);
                        setSdgModalData(null);
                    }
                });
            } else {
                onNavigateToRating(data.transactionId);
            }
            
            if (!notification.read) {
                onMarkAsRead(notification.id);
            }
        } catch (error) {
            console.error('Error navigating to rating:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message': return <MessageCircle size={18} className="text-blue-600" />;
            case 'like': return '❤️';
            case 'review': return '⭐';
            case 'purchase_request': return <ShoppingBag size={18} className="text-forest-600" />;
            case 'rate_prompt': return <Star size={18} className="text-amber-500" />;
            case 'report': return <AlertTriangle size={18} className="text-red-600" />;
            case 'purchase_cancelled': return <X size={18} className="text-gray-600" />;
            default: return '📢';
        }
    };

    const getNotificationBgColor = (type) => {
        switch (type) {
            case 'message': return 'bg-blue-100';
            case 'like': return 'bg-red-100';
            case 'review': return 'bg-amber-100/50';
            case 'purchase_request': return 'bg-forest-100';
            case 'rate_prompt': return 'bg-amber-100';
            case 'report': return 'bg-red-100';
            case 'purchase_cancelled': return 'bg-gray-100';
            default: return 'bg-cream-100';
        }
    };

    return (
        <div className="px-4 space-y-4">
            <div className="flex items-center justify-between py-6">
                <h2 className="text-2xl md:text-3xl font-light text-pine-900 tracking-wide">{t('notifications.title')}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onMarkAllAsRead}
                        className="flex items-center gap-1 text-sm text-pine-600 hover:text-pine-800 hover:bg-pine-100/50 px-3 py-1.5 rounded-full transition"
                    >
                        <CheckCheck size={16} />
                        {t('notifications.mark_all_read')}
                    </button>
                    {notifications.some(n => n.read) && (
                        <button
                            onClick={onDeleteAllRead}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full transition"
                        >
                            <Trash2 size={16} />
                            {t('notifications.delete_all_read')}
                        </button>
                    )}
                </div>
            </div>
            <div className="space-y-3">
                {notifications.map(notification => {
                    // Determine if this notification has action buttons
                    const hasActionButtons = (notification.type === 'purchase_request' && !notification.read) || notification.type === 'rate_prompt';

                    return (
                        <div
                            key={notification.id}
                            onClick={() => {
                                if (notification.type === 'rate_prompt') {
                                    handleRatingClick({ stopPropagation: () => {} }, notification);
                                } else if (!hasActionButtons && !notification.read) {
                                    onMarkAsRead(notification.id);
                                }
                            }}
                            className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl hover:shadow-md transition border border-pine-50 hover:border-pine-100 ${!notification.read ? 'border-l-4 border-l-pine-800 bg-white' : 'opacity-75'} ${(notification.type === 'rate_prompt' || (!hasActionButtons && !notification.read)) ? 'cursor-pointer' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-medium mb-1 ${!notification.read ? 'text-pine-900' : 'text-pine-600'}`}>
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-pine-600 mb-2">{notification.content}</p>
                                    <span className="text-xs text-pine-400">{notification.time}</span>

                                    {/* Action buttons for purchase_request */}
                                    {notification.type === 'purchase_request' && !notification.read && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={(e) => handleConfirm(e, notification)}
                                                disabled={processingIds[notification.id]}
                                                className="flex items-center gap-1 px-4 py-2 bg-forest-600 text-white text-sm rounded-xl hover:bg-forest-700 transition disabled:opacity-50"
                                            >
                                                <Check size={14} />
                                                {processingIds[notification.id] === 'confirming' ? t('notifications.processing') : t('notifications.confirm_trade')}
                                            </button>
                                            <button
                                                onClick={(e) => handleCancel(e, notification)}
                                                disabled={processingIds[notification.id]}
                                                className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
                                            >
                                                <X size={14} />
                                                {processingIds[notification.id] === 'cancelling' ? t('notifications.processing') : t('notifications.cancel')}
                                            </button>
                                        </div>
                                    )}

                                    {/* Rating prompt button */}
                                    {notification.type === 'rate_prompt' && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={(e) => handleRatingClick(e, notification)}
                                                className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600 transition"
                                            >
                                                <Star size={14} />
                                                {t('notifications.go_to_rate')}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMarkAsRead(notification.id);
                                                }}
                                                className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-300 transition"
                                            >
                                                {t('notifications.rate_later')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {notification.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteNotification(notification.id);
                                        }}
                                        className="text-red-400 hover:text-red-600 transition p-2"
                                        title={t('notifications.delete_this')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-pine-800 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {notifications.length === 0 && (
                    <div className="text-center py-20 text-pine-400">
                        {t('notifications.no_notifications')}
                    </div>
                )}
            </div>

            {/* SDG Carbon Reduction Modal */}
            {sdgModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-600 p-6 flex flex-col items-center justify-center text-white">
                            <TreePine size={64} className="mb-4 animate-bounce" />
                            <h3 className="text-2xl font-bold mb-1">{t('notifications.carbon_modal_title')}</h3>
                            <p className="text-sm opacity-90 text-center">{t('notifications.carbon_modal_subtitle')}</p>
                        </div>
                        <div className="p-6 text-center space-y-4">
                            <p className="text-gray-600">{t('notifications.carbon_modal_desc')}</p>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-emerald-800">
                                {sdgModalData.carbon} <span className="text-lg font-medium">kg CO2e</span>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl inline-flex items-center justify-center gap-2">
                                <span className="text-xl">🌳</span>
                                <span className="text-green-800 font-medium">
                                    {t('notifications.carbon_modal_trees_p1')} <b className="text-2xl">{sdgModalData.trees}</b> {t('notifications.carbon_modal_trees_p2')}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                            <button
                                onClick={() => {
                                    if (sdgModalData.onContinue) {
                                        sdgModalData.onContinue();
                                    } else {
                                        setSdgModalData(null);
                                    }
                                }}
                                className="w-full max-w-[200px] py-3 bg-gradient-to-r from-pine-600 to-pine-500 text-white rounded-full font-bold shadow-md shadow-pine-200 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
                            >
                                {sdgModalData.onContinue ? t('notifications.carbon_modal_btn_continue', { defaultValue: '前往評價' }) : t('notifications.carbon_modal_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
