import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image, MoreVertical, Phone } from 'lucide-react';

const ChatPage = ({ chats, onChatRead }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isComposing, setIsComposing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleOpenChat = (chat) => {
        setActiveChat(chat);
        setMessages([]); // Clear previous messages
        if (chat.unread > 0) {
            onChatRead(chat.id);
        }
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
                    sender: 'me',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                setInputText("");
                handleRemoveImage();
            } else {
                alert('傳送失敗');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('傳送失敗');
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

    if (activeChat) {
        return (
            <div className="fixed inset-x-0 top-[64px] bottom-0 md:relative md:top-0 md:inset-auto md:h-[calc(100vh-120px)] flex flex-col bg-white md:max-w-4xl md:mx-auto md:rounded-2xl md:shadow-lg overflow-hidden z-40">
                {/* Chat Header - Fixed at top */}
                <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-pine-100 shadow-sm flex-shrink-0">
                    <button
                        onClick={() => setActiveChat(null)}
                        className="p-2 -ml-2 text-pine-600 hover:bg-pine-50 rounded-full transition"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-lg text-pine-600 border border-white shadow-sm overflow-hidden">
                        {activeChat.avatar ? (
                            <img src={`http://localhost:3000${activeChat.avatar}`} alt={activeChat.name} className="w-full h-full object-cover" />
                        ) : (
                            '👤'
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-pine-900">{activeChat.name}</h3>
                        <p className="text-xs text-pine-500">{activeChat.department}</p>
                    </div>
                    <div className="flex items-center gap-1 text-pine-400">
                        <button className="p-2 hover:bg-pine-50 rounded-full transition">
                            <Phone size={20} />
                        </button>
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
        );
    }

    return (
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
                                    {chat.avatar ? (
                                        <img src={`http://localhost:3000${chat.avatar}`} alt={chat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        '👤'
                                    )}
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
