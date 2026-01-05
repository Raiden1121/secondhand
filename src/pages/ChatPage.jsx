import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image, MoreVertical, Phone, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';

const ChatPage = ({ chats, onChatRead, resetKey, onRefreshChats, initialChatId, onClearInitialChatId, initialProductId, onClearInitialProductId, setCurrentPage, onProductFromChat }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState(null);
    const [isToastExiting, setIsToastExiting] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [pendingProductId, setPendingProductId] = useState(null);
    const [pendingProduct, setPendingProduct] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Set pending product when entering chat from product page
    useEffect(() => {
        if (initialProductId && activeChat) {
            setPendingProductId(initialProductId);
            if (onClearInitialProductId) {
                onClearInitialProductId();
            }
        }
    }, [initialProductId, activeChat, onClearInitialProductId]);

    // Fetch pending product details
    useEffect(() => {
        if (pendingProductId) {
            const fetchProduct = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/products/${pendingProductId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setPendingProduct(data);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                }
            };
            fetchProduct();
        } else {
            setPendingProduct(null);
        }
    }, [pendingProductId]);

    const handleCancelPendingProduct = () => {
        setPendingProductId(null);
        setPendingProduct(null);
    };

    // Initial Chat Navigation
    useEffect(() => {
        if (initialChatId) {
            const target = chats.find(c => c.id === initialChatId);
            if (target) {
                setActiveChat(target);
                if (onClearInitialChatId) onClearInitialChatId();
            } else if (chats.length > 0) {
                // Chat not found in list but chats are loaded - fetch it directly 
                const fetchChatById = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        // Try finding in refreshed list
                        if (onRefreshChats) {
                            await onRefreshChats();
                        }
                    } catch (error) {
                        console.error('Error fetching chat:', error);
                    }
                };
                fetchChatById();
            }
        }
    }, [initialChatId, chats, onClearInitialChatId, onRefreshChats]);

    // Reset to chat list when resetKey changes
    useEffect(() => {
        if (resetKey > 0) {
            setActiveChat(null);
        }
    }, [resetKey]);

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

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('http://localhost:3000/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                }
            } catch (err) {
                console.error("Error fetching user", err);
            }
        };
        fetchUser();
    }, []);

    // Fetch messages when activeChat changes
    useEffect(() => {
        if (!activeChat) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/chat/${activeChat.id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const uiMessages = data.map(msg => ({
                        id: msg.id,
                        text: msg.content,
                        image: msg.image,
                        product: msg.product,
                        sender: msg.sender.id === currentUser?.id ? 'me' : 'other',
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        senderName: msg.sender.name,
                        senderAvatar: msg.sender.avatar
                    }));
                    setMessages(uiMessages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchMessages();
        }
    }, [activeChat, currentUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const renderAvatar = (avatar) => {
        if (!avatar) return '👤';
        if (avatar.startsWith('/uploads/') || avatar.startsWith('http')) {
            return <img src={avatar.startsWith('/') ? `http://localhost:3000${avatar}` : avatar} alt="Avatar" className="w-full h-full object-cover" />;
        }
        return <span className="text-2xl">{avatar}</span>;
    };

    const handleOpenChat = (chat) => {
        setActiveChat(chat);
        setMessages([]); // Clear previous messages
        if (chat.unread > 0) {
            onChatRead(chat.id);
        }
    };

    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation();

        setConfirmDialog({
            title: '刪除對話',
            message: '確定要刪除這個對話嗎？此操作無法復原。',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:3000/api/chat/${chatId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        showToast('success', '對話已刪除');
                        if (activeChat && activeChat.id === chatId) {
                            setActiveChat(null);
                        }
                        if (onRefreshChats) {
                            onRefreshChats();
                        }
                    } else {
                        showToast('error', '刪除失敗，請稍後再試');
                    }
                } catch (error) {
                    console.error('Error deleting chat:', error);
                    showToast('error', '刪除失敗，請稍後再試');
                }
                setConfirmDialog(null);
            },
            onCancel: () => setConfirmDialog(null)
        });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if ((!inputText.trim() && !selectedImage) || !activeChat) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            if (inputText.trim()) {
                formData.append('content', inputText);
            }
            if (selectedImage) {
                formData.append('image', selectedImage);
            }
            // Include product ID if pending (first message with product context)
            if (pendingProductId) {
                formData.append('productId', pendingProductId);
            }

            const response = await fetch(`http://localhost:3000/api/chat/${activeChat.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const newMsg = await response.json();
                setMessages(prev => [...prev, {
                    id: newMsg.id,
                    text: newMsg.content,
                    image: newMsg.image,
                    product: newMsg.product,
                    sender: 'me',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                setInputText("");
                handleRemoveImage();
                // Clear pending product after sending
                if (pendingProductId) {
                    setPendingProductId(null);
                }
            } else {
                showToast('error', '傳送失敗');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('error', '傳送失敗');
        }
    };

    // Format time for chat list
    const formatTime = (time) => {
        if (!time) return '';
        const date = new Date(time);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return '剛剛';
        if (hours < 24) return `${hours}小時前`;
        if (days === 1) return '昨天';
        return date.toLocaleDateString('zh-TW');
    };

    // Render toast and confirm dialog globally
    const renderGlobalUI = () => (
        <>
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                    } ${isToastExiting ? 'animate-slide-up' : 'animate-slide-down'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={confirmDialog.onCancel}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-pine-900 mb-2">{confirmDialog.title}</h3>
                        <p className="text-pine-600 mb-6">{confirmDialog.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={confirmDialog.onCancel}
                                className="px-4 py-2 rounded-xl text-pine-600 hover:bg-pine-50 transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm hover:shadow-md"
                            >
                                確定刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    if (activeChat) {
        return (
            <>
                {renderGlobalUI()}
                <div className="fixed inset-x-0 top-[64px] bottom-0 md:relative md:top-0 md:inset-auto md:h-[calc(100vh-120px)] flex flex-col bg-white md:max-w-4xl md:mx-auto md:rounded-2xl md:shadow-lg overflow-hidden z-40">
                    {/* Chat Header - Fixed at top */}
                    <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-pine-100 shadow-sm flex-shrink-0">
                        <button
                            onClick={() => setActiveChat(null)}
                            className="p-2 -ml-2 text-pine-600 hover:bg-pine-50 rounded-full transition"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div
                            onClick={() => activeChat.partnerId && setCurrentPage(`seller-${activeChat.partnerId}`)}
                            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition"
                        >
                            <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-lg text-pine-600 border border-white shadow-sm overflow-hidden">
                                {renderAvatar(activeChat.avatar)}
                            </div>
                            <div>
                                <h3 className="font-medium text-pine-900">{activeChat.name}</h3>
                                <p className="text-xs text-pine-500">{activeChat.department}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-pine-400">
                            {/* <button className="p-2 hover:bg-pine-50 rounded-full transition">
                                <Phone size={20} />
                            </button> */}
                            <button className="p-2 hover:bg-pine-50 rounded-full transition">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Container - Scrollable, fills remaining space */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-forest-50/20 to-white">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-pine-500">載入中...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-10 text-pine-400">開始對話吧！</div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] rounded-2xl text-sm shadow-sm ${msg.sender === 'me'
                                        ? 'bg-pine-800 text-white rounded-tr-sm'
                                        : 'bg-white text-pine-800 border border-pine-50 rounded-tl-sm'
                                        }`}>
                                        {msg.product && (
                                            <div
                                                onClick={() => onProductFromChat ? onProductFromChat(activeChat.id, msg.product.id) : setCurrentPage(`product-${msg.product.id}`)}
                                                className="cursor-pointer hover:opacity-90 transition p-3 border-b border-pine-100/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-cream-50 rounded-lg overflow-hidden flex-shrink-0">
                                                        {msg.product.images && (() => {
                                                            try {
                                                                const images = typeof msg.product.images === 'string' ? JSON.parse(msg.product.images) : msg.product.images;
                                                                const firstImage = images && images.length > 0 ? images[0] : null;
                                                                return firstImage ? (
                                                                    <img src={`http://localhost:3000${firstImage}`} alt={msg.product.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-2xl flex items-center justify-center h-full">📦</span>
                                                                );
                                                            } catch {
                                                                return <span className="text-2xl flex items-center justify-center h-full">📦</span>;
                                                            }
                                                        })()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm truncate ${msg.sender === 'me' ? 'text-white' : 'text-pine-900'}`}>
                                                            {msg.product.title}
                                                        </p>
                                                        <p className={`text-xs ${msg.sender === 'me' ? 'text-pine-200' : 'text-pine-600'}`}>
                                                            NT$ {msg.product.price?.toLocaleString?.() || msg.product.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {msg.image && (
                                            <img
                                                src={`http://localhost:3000${msg.image}`}
                                                alt="Shared image"
                                                className="max-w-[300px] max-h-[400px] w-auto h-auto rounded-t-2xl cursor-pointer hover:opacity-90 transition object-contain"
                                                onClick={() => window.open(`http://localhost:3000${msg.image}`, '_blank')}
                                            />
                                        )}
                                        {msg.text && <p className="px-4 py-2.5">{msg.text}</p>}
                                        <p className={`text-[10px] px-4 pb-2 text-right ${msg.sender === 'me' ? 'text-pine-200' : 'text-pine-400'
                                            }`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar - Fixed at bottom */}
                    <div className="bg-white border-t border-pine-100 px-4 py-3 shadow-lg flex-shrink-0">
                        {/* Pending Product Preview */}
                        {pendingProduct && (
                            <div className="mb-3 bg-forest-50 border border-forest-200 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                    {(() => {
                                        try {
                                            const images = typeof pendingProduct.images === 'string' ? JSON.parse(pendingProduct.images) : pendingProduct.images;
                                            const firstImage = images && images.length > 0 ? images[0] : null;
                                            return firstImage ? (
                                                <img src={`http://localhost:3000${firstImage}`} alt={pendingProduct.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl flex items-center justify-center h-full">📦</span>
                                            );
                                        } catch {
                                            return <span className="text-xl flex items-center justify-center h-full">📦</span>;
                                        }
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-forest-600 mb-0.5">發送訊息時將附帶商品資訊</p>
                                    <p className="text-sm font-medium text-pine-900 truncate">{pendingProduct.title}</p>
                                </div>
                                <button
                                    onClick={handleCancelPendingProduct}
                                    className="w-7 h-7 flex items-center justify-center text-pine-500 hover:text-red-500 hover:bg-red-50 rounded-full transition flex-shrink-0"
                                    title="取消附帶商品"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        {imagePreview && (
                            <div className="mb-2 relative inline-block">
                                <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        <div className="flex items-end gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-pine-600 hover:bg-pine-50 rounded-full flex-shrink-0 transition"
                            >
                                <Image size={22} />
                            </button>

                            <div className="flex-1 bg-cream-50 border border-pine-200 rounded-2xl px-4 py-2 focus-within:border-pine-400 focus-within:ring-2 focus-within:ring-pine-200 transition">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="輸入訊息..."
                                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-pine-800 placeholder-pine-400 resize-none max-h-24 text-sm leading-relaxed"
                                    rows="1"
                                    onCompositionStart={() => setIsComposing(true)}
                                    onCompositionEnd={() => setIsComposing(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                className={`p-2.5 rounded-full transition shadow-sm flex-shrink-0 ${(inputText.trim() || selectedImage)
                                    ? 'bg-pine-800 text-white hover:bg-pine-700 shadow-md transform hover:-translate-y-0.5'
                                    : 'bg-pine-100 text-pine-300 cursor-not-allowed'
                                    }`}
                                disabled={!inputText.trim() && !selectedImage}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {renderGlobalUI()}
            <div className="px-4 py-6 max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-light text-pine-900 pb-6 tracking-wide">對話</h2>
                <div className="space-y-3">
                    {chats.length === 0 ? (
                        <div className="text-center py-10 text-pine-400">目前沒有對話</div>
                    ) : (
                        <div className="space-y-3">
                            {chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => handleOpenChat(chat)}
                                    className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl hover:shadow-md transition cursor-pointer flex items-center gap-4 border ${chat.unread > 0 ? 'border-l-4 border-l-pine-800 border-y-pine-50 border-r-pine-50 bg-white' : 'border-pine-50 hover:border-pine-100'
                                        }`}
                                >
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-cream-100 rounded-full flex items-center justify-center text-xl flex-shrink-0 text-pine-600 border-2 border-transparent group-hover:border-pine-100 transition overflow-hidden">
                                        {renderAvatar(chat.avatar)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-medium truncate ${chat.unread > 0 ? 'text-pine-900 font-bold' : 'text-pine-800'}`}>
                                                {chat.name}
                                            </h3>
                                            <span className="text-xs text-pine-400 flex-shrink-0 ml-2">{formatTime(chat.time)}</span>
                                        </div>
                                        <p className={chat.unread > 0 ? "text-sm text-pine-800 font-medium truncate" : "text-sm text-pine-600 truncate"}>
                                            {chat.lastMsg || '開始新的對話'}
                                        </p>
                                    </div>
                                    {chat.unread > 0 && (
                                        <div className="w-5 h-5 bg-pine-800 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                            {chat.unread}
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => handleDeleteChat(chat.id, e)}
                                        className="p-2 text-pine-400 hover:text-red-600 hover:bg-red-50 rounded-full transition flex-shrink-0"
                                        title="刪除對話"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatPage;
