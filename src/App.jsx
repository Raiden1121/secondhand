import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ChatPage from './pages/ChatPage';
import NotificationPage from './pages/NotificationPage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { mockNotifications } from './data/mock';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  // 模擬對話列表狀態
  const [chats, setChats] = useState([
    { id: 1, name: '資工系 王同學', unread: 2, lastMsg: '請問這個還有嗎？', time: '2小時前' },
    { id: 2, name: '企管系 陳同學', unread: 1, lastMsg: '我想約明天面交', time: '5小時前' },
    { id: 3, name: '數學系 林同學', unread: 0, lastMsg: '好的，謝謝！', time: '昨天' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  // 計算對話未讀總數 (不只是對話數，而是所有未讀訊息的總和，或者是有未讀對話的數量？通常 social app 顯示的是有未讀的對話數或是訊息總數。
  // 根據使用者的描述 "對話未讀變成聊天室未讀的數量(人)" -> 應該是指有多少個聊天室有未讀訊息。)
  // User request: "對話未讀變成聊天室未讀的數量(人)" -> Number of chats with unread messages.
  const chatUnreadCount = chats.filter(c => c.unread > 0).length;

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleChatRead = (id) => {
    setChats(prev => prev.map(c =>
      c.id === id ? { ...c, unread: 0 } : c
    ));
  };

  return (
    <div className="min-h-screen bg-forest-50/30 text-pine-900 font-sans">
      {/* 頂部導航 - 手機隱藏或简化 */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        unreadCount={unreadCount}
        chatUnreadCount={chatUnreadCount}
        isLoggedIn={isAuthenticated}
        onLogin={handleLogin}
      />

      {/* 主要內容區 */}
      <div className="max-w-6xl mx-auto pb-24 md:pb-8">
        {currentPage === 'landing' && <LandingPage onNavigateToLogin={() => setCurrentPage('login')} />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'chat' && (
          <ChatPage
            chats={chats}
            onChatRead={handleChatRead}
          />
        )}
        {currentPage === 'post' && <PostPage />}
        {currentPage === 'notifications' && (
          <NotificationPage
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        )}
        {currentPage === 'profile' && <ProfilePage onLogout={handleLogout} />}
        {currentPage.startsWith('product-') && (
          <ProductDetailPage
            productId={currentPage.split('-')[1]}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* 底部導航列 - 只在手機顯示 */}
      {isAuthenticated && (
        <MobileNav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          unreadCount={unreadCount}
          chatUnreadCount={chatUnreadCount}
        />
      )}
    </div>
  );
}

export default App;
