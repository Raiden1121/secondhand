import React, { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Flag, ArrowLeft, CheckCircle, AlertCircle, Share2, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { meetingPoints } from '../data/mock';

const ProductDetailPage = ({ productId, setCurrentPage, onChatCreated, onNavigateToChat, productBackPage, onClearBackPage, onNavigateToSeller }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [isToastExiting, setIsToastExiting] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [sellerAvatarError, setSellerAvatarError] = useState(false);
    const [hasPendingPurchase, setHasPendingPurchase] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [sellerRating, setSellerRating] = useState({ averageScore: 0, totalRatings: 0 });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/products/${productId}`);
                if (!response.ok) throw new Error('商品不存在');
                const data = await response.json();
                setProduct(data);

                // Fetch seller rating
                if (data.sellerId) {
                    try {
                        const ratingRes = await fetch(`http://localhost:3000/api/ratings/user/${data.sellerId}`);
                        if (ratingRes.ok) {
                            const ratingData = await ratingRes.json();
                            setSellerRating({
                                averageScore: ratingData.averageScore || 0,
                                totalRatings: ratingData.totalRatings || 0
                            });
                        }
                    } catch (e) {
                        console.error('Error fetching seller rating:', e);
                    }
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // Toast Timer and Animation
    useEffect(() => {
        if (toast) {
            setIsToastExiting(false);
            const timer = setTimeout(() => {
                setIsToastExiting(true);
                setTimeout(() => {
                    setToast(null);
                    setIsToastExiting(false);
                }, 450); // Slightly less than 0.5s animation
            }, 3000);
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

    // Check if user has pending purchase for this product
    useEffect(() => {
        const checkPurchaseStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token || !productId) return;

            try {
                const response = await fetch(`http://localhost:3000/api/transactions/product/${productId}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setHasPendingPurchase(data.hasPendingRequest);
                }
            } catch (err) {
                console.error('Error checking purchase status:', err);
            }
        };
        checkPurchaseStatus();
    }, [productId]);

    const handlePurchaseRequest = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('error', '請先登入');
            setCurrentPage('login');
            return;
        }

        // Check if user is the seller
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        if (product?.sellerId === userId) {
            showToast('error', '不能購買自己的商品');
            return;
        }

        setPurchaseLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/transactions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId: parseInt(productId) })
            });

            if (response.ok) {
                setHasPendingPurchase(true);
                showToast('success', '已發送購買請求給賣家');
            } else {
                const err = await response.json();
                showToast('error', err.message || '發送購買請求失敗');
            }
        } catch (err) {
            console.error('Error creating purchase request:', err);
            showToast('error', '發送購買請求失敗');
        } finally {
            setPurchaseLoading(false);
        }
    };

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

    const handleShare = async () => {
        try {
            const url = `${window.location.origin}/#product-${productId}`;
            await navigator.clipboard.writeText(url);
            showToast('success', '連結已複製到剪貼簿');
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('error', '複製失敗，請稍後再試');
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
                const chat = await response.json();

                // Refresh chat list in App component
                if (onChatCreated) {
                    await onChatCreated();
                }

                // Navigate to chat with product context
                if (onNavigateToChat) {
                    onNavigateToChat(chat.id, productId);
                } else {
                    setCurrentPage('chat');
                }
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
    const currentImage = images && images.length > 0 ? images[selectedImageIndex] : null;

    // Double click handler for zoom
    const handleDoubleClick = () => {
        if (currentImage) {
            setShowZoomModal(true);
        }
    };

    const reportReasons = [
        '商品資訊不實',
        '疑似詐騙',
        '違禁品或違法商品',
        '不當內容',
        '其他'
    ];

    return (
        <div className="h-full overflow-hidden bg-transparent">
            {/* Toast Notification */}
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                    } ${isToastExiting ? 'animate-slide-up' : 'animate-slide-down'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            <div className="max-w-2xl mx-auto h-full flex flex-col">
                <div className="bg-white rounded-t-3xl shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Image Section - flexible height based on viewport */}
                    <div className="min-h-[35%] max-h-[46%] bg-cream-50 flex flex-col overflow-hidden flex-shrink-0 relative">
                        {/* Back Button - Absolutely positioned */}
                        <button
                            onClick={() => {
                                if (productBackPage) {
                                    if (productBackPage.type === 'chat' && productBackPage.chatId) {
                                        if (onNavigateToChat) {
                                            onNavigateToChat(productBackPage.chatId);
                                        } else {
                                            setCurrentPage('chat');
                                        }
                                    } else if (productBackPage.type === 'profile') {
                                        setCurrentPage('profile');
                                    } else if (productBackPage.type === 'seller' && productBackPage.sellerId) {
                                        setCurrentPage(`seller-${productBackPage.sellerId}`);
                                    }
                                    if (onClearBackPage) onClearBackPage();
                                } else {
                                    setCurrentPage('home');
                                }
                            }}
                            className="absolute top-4 left-4 w-10 h-10 bg-pine-800/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-pine-700 transition shadow-lg z-10"
                            title="返回"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        {/* Main Image Area */}
                        <div
                            className="flex-1 flex items-center justify-center min-h-0 cursor-pointer"
                            onDoubleClick={handleDoubleClick}
                        >
                            {currentImage ? (
                                <img
                                    src={`http://localhost:3000${currentImage}`}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-pine-200 text-9xl">📦</span>
                            )}
                        </div>

                        {/* Image Counter Dots - on main image */}
                        {images && images.length > 1 && (
                            <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full mb-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === selectedImageIndex
                                            ? 'bg-white w-4'
                                            : 'bg-white/50 hover:bg-white/70'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Thumbnail Strip */}
                        {images && images.length > 1 && (
                            <div className="h-14 sm:h-16 md:h-20 bg-white/80 backdrop-blur-sm border-t border-pine-100 flex-shrink-0">
                                <div className="h-full overflow-x-auto scrollbar-hide">
                                    <div className="h-full flex gap-1.5 md:gap-5 px-2 py-1.5">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImageIndex(idx)}
                                                className={`h-full aspect-square rounded-lg overflow-hidden flex-shrink-0 transition-all ${idx === selectedImageIndex
                                                    ? 'ring-2 ring-pine-800 ring-offset-1'
                                                    : 'opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={`http://localhost:3000${img}`}
                                                    alt={`${product.title} ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Section - scrollable flex column */}
                    <div className="flex-1 p-4 md:p-6 pb-20 flex flex-col min-h-0 overflow-y-auto">
                        {/* Header Info - Fixed */}
                        <div className="flex-shrink-0 space-y-2">
                            <div>
                                <div className="flex items-start justify-between mb-1">
                                    <h1 className="text-2xl md:text-3xl font-light text-pine-900 tracking-wide truncate">{product.title}</h1>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={handleShare}
                                            className="p-1 hover:bg-cream-100 rounded-full transition"
                                            title="分享商品"
                                        >
                                            <Share2
                                                size={20}
                                                className="text-pine-400"
                                            />
                                        </button>
                                        <button
                                            onClick={toggleFavorite}
                                            className="p-1 hover:bg-cream-100 rounded-full transition"
                                            title="收藏商品"
                                        >
                                            <Heart
                                                size={24}
                                                className={isFavorited ? "text-red-500 fill-red-500" : "text-pine-400"}
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-xs font-medium">
                                        {product.category}
                                    </span>
                                    <span className="text-pine-500 text-xs">
                                        {product.condition}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-3xl md:text-4xl font-light text-pine-800">
                                    NT$ {product.price?.toLocaleString?.() || product.price}
                                </span>
                                <span className="text-sm text-pine-400 font-light">{product.negotiable ? '可議價' : '不議價'}</span>
                            </div>
                            {product.deliveryMethod?.includes('寄送') && (
                                <span className="inline-block text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 w-fit">可寄送</span>
                            )}

                            <div className="border-t border-pine-100 pt-3 flex items-center justify-between">
                                <div
                                    className="flex items-center gap-3 cursor-pointer hover:bg-cream-50 p-2 -m-2 rounded-lg transition"
                                    onClick={() => {
                                        if (onNavigateToSeller) {
                                            onNavigateToSeller(product.sellerId, productId);
                                        } else {
                                            setCurrentPage(`seller-${product.sellerId}`);
                                        }
                                    }}
                                >
                                    <div className="w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center text-base overflow-hidden">
                                        {product.seller?.avatar && product.seller.avatar.trim() !== '' && !sellerAvatarError ? (
                                            <img
                                                src={`http://localhost:3000${product.seller.avatar}`}
                                                alt={product.seller.name}
                                                className="w-full h-full object-cover"
                                                onError={() => setSellerAvatarError(true)}
                                            />
                                        ) : (
                                            <span className="text-lg">👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-pine-800 font-medium block text-sm">{product.seller?.name || '未知賣家'}</span>
                                        <span className="text-xs text-pine-500">{product.seller?.department}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    <span className="font-medium text-pine-700 text-sm">{sellerRating.averageScore.toFixed(1)}</span>
                                    <span className="text-pine-400 text-xs">({sellerRating.totalRatings})</span>
                                </div>
                            </div>
                        </div>

                        {/* Description - Limited height with scroll */}
                        <div className="flex-1 min-h-0 border-t border-pine-100 mt-3 pt-3 flex flex-col max-h-56">
                            <h3 className="text-sm font-medium text-pine-600 mb-2 flex-shrink-0">關於這件物品</h3>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 border border-pine-100 rounded-lg p-2">
                                <p className="text-pine-700 leading-relaxed whitespace-pre-line break-all text-sm">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Footer Info - Fixed */}
                        <div className="flex-shrink-0 pt-3 space-y-3">
                            {product.deliveryMethod?.includes('面交') && (
                                <div className="border-t border-pine-100 pt-3">
                                    <h3 className="text-sm font-medium text-pine-600 mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-pine-400" />
                                        建議見面地點
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(product.location
                                            ? product.location.split('、').filter(l => l.trim())
                                            : meetingPoints
                                        ).map((point, index) => (
                                            <span key={`${point}-${index}`} className="bg-forest-50 text-forest-700 px-2 py-1 rounded-full text-xs border border-forest-100">
                                                {point}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-6">
                                <button
                                    onClick={handleStartChat}
                                    className="flex-1 bg-pine-800 text-white py-3 rounded-2xl font-medium hover:bg-pine-700 transition shadow-md hover:shadow-lg transform active:scale-[0.98] text-sm"
                                >
                                    開始對話
                                </button>
                                <button
                                    onClick={handlePurchaseRequest}
                                    disabled={hasPendingPurchase || purchaseLoading || product?.reserved}
                                    className={`flex-1 py-3 rounded-2xl font-medium transition shadow-md hover:shadow-lg transform active:scale-[0.98] text-sm flex items-center justify-center gap-2 ${hasPendingPurchase || product?.reserved
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-forest-600 text-white hover:bg-forest-700'
                                        }`}
                                >
                                    <ShoppingBag size={16} />
                                    {purchaseLoading ? '發送中...' : hasPendingPurchase ? '已發送請求' : product?.reserved ? '已保留' : '確認購買'}
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="px-4 py-3 border border-pine-200 text-pine-600 rounded-2xl hover:bg-cream-50 transition"
                                >
                                    <Flag size={18} />
                                </button>
                            </div>
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

            {/* Zoom Modal */}
            {showZoomModal && currentImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
                    onClick={() => setShowZoomModal(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setShowZoomModal(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition z-10"
                    >
                        <X size={24} />
                    </button>

                    {/* Image Counter */}
                    {images && images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Previous Button */}
                    {images && images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                            }}
                            className="absolute left-4 w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    {/* Zoomed Image */}
                    <img
                        src={`http://localhost:3000${currentImage}`}
                        alt={product.title}
                        className="max-w-[95vw] max-h-[95vh] min-w-[60vw] min-h-[60vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next Button */}
                    {images && images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                            }}
                            className="absolute right-4 w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
