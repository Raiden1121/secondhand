import React, { useState } from 'react';
import { ArrowLeft, Send, Image, MoreVertical, Phone } from 'lucide-react';

const ChatPage = ({ chats, onChatRead }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([
        { id: 1, text: "請問這個還有嗎？", sender: "me", time: "14:30" },
        { id: 2, text: "還在喔！目前還有兩個人在詢問，您要的話可以優先保留給您。", sender: "other", time: "14:32" },
        { id: 3, text: "那我想約面交，明天中午方便嗎？", sender: "me", time: "14:35" },
    ]);
    const [inputText, setInputText] = useState("");

    const handleOpenChat = (chat) => {
        setActiveChat(chat);
        if (chat.unread > 0) {
            onChatRead(chat.id); // 呼叫 App.jsx 的函式更新狀態
        }
    };


    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1,
            text: inputText,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setInputText("");
    };

    if (activeChat) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] -mx-4 -my-4 md:mx-0 md:my-0 bg-forest-50/30 md:bg-transparent relative">
                {/* Chat Header */}
                <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-pine-100 sticky top-0 z-10 shadow-sm md:rounded-t-2xl">
                    <button
                        onClick={() => setActiveChat(null)}
                        className="p-2 -ml-2 text-pine-600 hover:bg-pine-50 rounded-full transition"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center text-lg text-pine-600 border border-white shadow-sm">
                        👤
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-pine-900">{activeChat.name}</h3>
                        <p className="text-xs text-pine-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                            線上
                        </p>
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

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'me'
                                ? 'bg-pine-800 text-white rounded-tr-sm'
                                : 'bg-white text-pine-800 border border-pine-50 rounded-tl-sm'
                                }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-pine-200' : 'text-pine-400'
                                    }`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="bg-white p-3 md:p-4 border-t border-pine-100 md:rounded-b-2xl">
                    <div className="flex items-end gap-2">
                        <button className="p-2.5 text-pine-400 hover:bg-pine-50 rounded-full transition">
                            <Image size={22} />
                        </button>
                        <div className="flex-1 bg-forest-50/50 rounded-2xl px-4 py-2 border border-pine-100 focus-within:border-pine-300 focus-within:bg-white transition">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="輸入訊息..."
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-pine-800 placeholder-pine-400 resize-none max-h-24 text-sm leading-relaxed"
                                rows="1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            className={`p-2.5 rounded-full transition shadow-sm ${inputText.trim()
                                ? 'bg-pine-800 text-white hover:bg-pine-700 shadow-md transform hover:-translate-y-0.5'
                                : 'bg-pine-100 text-pine-300 cursor-not-allowed'
                                }`}
                            disabled={!inputText.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 space-y-4">
            <h2 className="text-2xl md:text-3xl font-light text-pine-900 py-6 tracking-wide">對話</h2>
            <div className="space-y-3">
                <div className="space-y-3">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => handleOpenChat(chat)}
                            className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl hover:shadow-md transition cursor-pointer flex items-center gap-4 border ${chat.unread > 0 ? 'border-l-4 border-l-pine-800 border-y-pine-50 border-r-pine-50 bg-white' : 'border-pine-50 hover:border-pine-100'
                                }`}
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-cream-100 rounded-full flex items-center justify-center text-xl flex-shrink-0 text-pine-600 border-2 border-transparent group-hover:border-pine-100 transition">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-medium truncate ${chat.unread > 0 ? 'text-pine-900 font-bold' : 'text-pine-800'}`}>
                                        {chat.name}
                                    </h3>
                                    <span className="text-xs text-pine-400 flex-shrink-0 ml-2">{chat.time}</span>
                                </div>
                                <p className={chat.unread > 0 ? "text-sm text-pine-800 font-medium truncate" : "text-sm text-pine-600 truncate"}>
                                    {chat.lastMsg}
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
            </div>
        </div>
    );
};

export default ChatPage;
