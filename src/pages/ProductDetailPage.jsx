import React, { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Flag, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { meetingPoints } from '../data/mock';

const ProductDetailPage = ({ productId, setCurrentPage, onChatCreated }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/products/${productId}`);
                if (!response.ok) throw new Error('商品不存在');
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (type, message) => {
        setToast({ type, message });
    };

    // Check if favorited on load
    useEffect(() => {
        const checkFavorite = async () => {
            const token = localStorage.getItem('token');
            if (!token || !productId) return;

            try {
                const response = await fetch(`http://localhost:3000/api/favorites/check/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsFavorited(data.isFavorited);
                }
            } catch (err) {
                console.error('Error checking favorite:', err);
            }
        };
        checkFavorite();
    }, [productId]);

    const toggleFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('error', '請先登入');
            setCurrentPage('login');
            return;
        }

        try {
            const method = isFavorited ? 'DELETE' : 'POST';
            const response = await fetch(`http://localhost:3000/api/favorites/${productId}`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setIsFavorited(!isFavorited);
            } else {
                const err = await response.json();
                showToast('error', err.message);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            showToast('error', '請選擇或輸入檢舉原因');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('error', '請先登入');
            setCurrentPage('login');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:3000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId, reason: reportReason })
            });

            if (response.ok) {
                showToast('success', '檢舉已送出，我們會盡快處理');
                setShowReportModal(false);
                setReportReason('');
            } else {
                const err = await response.json();
                showToast('error', err.message);
            }
        } catch (err) {
            console.error('Error reporting:', err);
            showToast('error', '系統錯誤，請稍後再試');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartChat = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('error', '請先登入');
            setCurrentPage('login');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/chat/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId: product.sellerId })
            });

            if (response.ok) {
                // Refresh chat list in App component
                if (onChatCreated) {
                    await onChatCreated();
                }
                setCurrentPage('chat');
            } else {
                const err = await response.json();
                showToast('error', err.message || '無法開啟對話');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            showToast('error', '系統錯誤，請稍後再試');
        }
    };

    if (loading) return <div className="p-10 text-center text-pine-600">載入中...</div>;
    if (error || !product) return <div className="p-10 text-center text-pine-600">找不到商品</div>;

    // Parse images
    let images = product.images;
    if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch { images = []; }
    }
    const coverImage = images && images.length > 0 ? images[0] : null;

    const reportReasons = [
        '商品資訊不實',
        '疑似詐騙',
        '違禁品或違法商品',
        '不當內容',
        '其他'
    ];

    return (
        <div className="min-h-screen bg-transparent">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-forest-600 text-white' : 'bg-red-500 text-white'
                    }`} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => setCurrentPage('home')}
                    className="px-4 py-6 text-pine-600 hover:text-pine-800 text-sm flex items-center gap-1"
                >
                    <ArrowLeft size={16} /> 返回
                </button>

                <div className="bg-white rounded-t-3xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-cream-50 flex items-center justify-center text-9xl overflow-hidden">
                        {coverImage ? (
                            <img src={`http://localhost:3000${coverImage}`} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-pine-200">📦</span>
                        )}
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <h1 className="text-2xl md:text-3xl font-light text-pine-900 tracking-wide">{product.title}</h1>
                                <button
                                    onClick={toggleFavorite}
                                    className="p-2 hover:bg-cream-100 rounded-full transition"
                                >
                                    <Heart
                                        size={24}
                                        className={isFavorited ? "text-red-500 fill-red-500" : "text-pine-400"}
                                    />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {product.category}
                                </span>
                                <span className="text-pine-500 text-xs">
                                    {product.status === 'active' ? '販售中' : '已售出'}
                                </span>
                            </div>
                        </div>

                        <div className="text-3xl md:text-4xl font-light text-pine-800">
                            NT$ {product.price?.toLocaleString?.() || product.price}
                        </div>

                        <div className="border-t border-pine-100 pt-6">
                            <h3 className="text-sm font-medium text-pine-600 mb-3">賣家</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-lg overflow-hidden">
                                        👤
                                    </div>
                                    <div>
                                        <span className="text-pine-800 font-medium block">{product.seller?.name || '未知賣家'}</span>
                                        <span className="text-xs text-pine-500">{product.seller?.department}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-amber-500 fill-amber-500" />
                                    <span className="font-medium text-pine-700">4.8</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-pine-100 pt-6">
                            <h3 className="text-sm font-medium text-pine-600 mb-3">關於這件物品</h3>
                            <p className="text-pine-700 leading-relaxed whitespace-pre-line">
                                {product.description || '這是一件用心保養的物品，希望能找到懂得欣賞它的新主人。'}
                            </p>
                        </div>

                        <div className="border-t border-pine-100 pt-6">
                            <h3 className="text-sm font-medium text-pine-600 mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-pine-400" />
                                建議見面地點
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(product.location ? [product.location] : meetingPoints).map(point => (
                                    <span key={point} className="bg-forest-50 text-forest-700 px-3 py-1.5 rounded-full text-xs border border-forest-100">
                                        {point}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleStartChat}
                                className="flex-1 bg-pine-800 text-white py-4 rounded-2xl font-medium hover:bg-pine-700 transition shadow-md hover:shadow-lg transform active:scale-[0.98]"
                            >
                                開始對話
                            </button>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="px-5 py-4 border border-pine-200 text-pine-600 rounded-2xl hover:bg-cream-50 transition"
                            >
                                <Flag size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-pine-100">
                            <h3 className="text-xl font-medium text-pine-900">檢舉此商品</h3>
                            <p className="text-sm text-pine-500 mt-1">請選擇檢舉原因</p>
                        </div>
                        <div className="p-6 space-y-3">
                            {reportReasons.map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setReportReason(reason)}
                                    className={`w-full text-left p-4 rounded-xl border transition ${reportReason === reason
                                        ? 'border-forest-500 bg-forest-50 text-forest-700'
                                        : 'border-pine-200 hover:bg-cream-50 text-pine-700'
                                        }`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 border-t border-pine-100 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportReason('');
                                }}
                                className="flex-1 py-3 px-4 rounded-xl border border-pine-200 text-pine-600 hover:bg-cream-50 transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!reportReason || submitting}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? '送出中...' : '送出檢舉'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
