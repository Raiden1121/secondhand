import React, { useState, useEffect, useCallback } from 'react';
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

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchChats();
    }
  }, [isAuthenticated, fetchNotifications, fetchChats]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const chatUnreadCount = chats.filter(c => c.unread > 0).length;

  // Check for token in URL (OAuth callback) or localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('token');

      // Check URL for token from OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        token = urlToken;
        localStorage.setItem('token', token);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.id) {
              setUser(userData);
              setIsAuthenticated(true);

              if (!userData.name || !userData.department) {
                setCurrentPage('profile');
              } else {
                setCurrentPage('landing');
              }
            } else {
              localStorage.removeItem('token');
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    if (!userData.name || !userData.department) {
      setCurrentPage('profile');
    } else {
      setCurrentPage('landing');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    setChats([]);
    setCurrentPage('landing');
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('http://localhost:3000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleChatRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`http://localhost:3000/api/chat/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setChats(prev => prev.map(c =>
        c.id === id ? { ...c, unread: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
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
      <div className={currentPage === 'chat' ? '' : 'max-w-6xl mx-auto pb-24 md:pb-8'}>
        {currentPage === 'landing' && (
          <LandingPage
            onNavigateToLogin={() => setCurrentPage('login')}
            isAuthenticated={isAuthenticated}
            onNavigateToHome={() => setCurrentPage('home')}
            onNavigateToPost={() => setCurrentPage('post')}
          />
        )}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />}
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'chat' && (
          <ChatPage
            chats={chats}
            onChatRead={handleChatRead}
          />
        )}
        {currentPage === 'post' && <PostPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'notifications' && (
          <NotificationPage
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        )}
        {currentPage === 'profile' && <ProfilePage user={user} onLogout={handleLogout} />}
        {currentPage.startsWith('product-') && (
          <ProductDetailPage
            productId={currentPage.split('-')[1]}
            setCurrentPage={setCurrentPage}
            onChatCreated={fetchChats}
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
