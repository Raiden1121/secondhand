import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/layout/Navbar";
import MobileNav from "./components/layout/MobileNav";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ChatPage from "./pages/ChatPage";
import NotificationPage from "./pages/NotificationPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SellerPage from "./pages/SellerPage";
import RatingPage from "./pages/RatingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatResetKey, setChatResetKey] = useState(0);
  const [initialChatId, setInitialChatId] = useState(null);
  const [initialProductId, setInitialProductId] = useState(null);
  const [productBackPage, setProductBackPage] = useState(null); // Tracks where to return from product page
  const [sellerBackPage, setSellerBackPage] = useState(null); // Tracks where to return from seller page

  // Handle page navigation with reset capability
  const handlePageChange = (page) => {
    if (page === "chat" && currentPage === "chat") {
      // If already on chat page, trigger reset to go back to chat list
      setChatResetKey((prev) => prev + 1);
    } else {
      setCurrentPage(page);
    }
  };

  const handleNavigateToChat = (chatId, productId = null) => {
    setInitialChatId(chatId);
    setInitialProductId(productId);
    setCurrentPage("chat");
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchChats();
    }
  }, [isAuthenticated, fetchNotifications, fetchChats]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const chatUnreadCount = chats.filter((c) => c.unread > 0).length;

  // Check for token in URL (OAuth callback) or localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem("token");

      // Check URL for token from OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");

      if (urlToken) {
        token = urlToken;
        localStorage.setItem("token", token);
        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.id) {
              setUser(userData);
              setIsAuthenticated(true);

              // Check for hash in URL (e.g., #product-123 or #reset-password=123)
              const hash = window.location.hash.slice(1); // Remove the # symbol
              if (hash.startsWith("product-") || hash.startsWith("reset-password=") || hash.startsWith("verify-email=")) {
                setCurrentPage(hash);
              } else if (!userData.name || !userData.department) {
                setCurrentPage("profile");
              } else {
                setCurrentPage("landing");
              }
            } else {
              localStorage.removeItem("token");
              // Check if URL has reset password hash or verify email hash, navigate appropriately even if logged out
              const hash = window.location.hash.slice(1);
              if (hash.startsWith("reset-password=") || hash.startsWith("verify-email=")) {
                setCurrentPage(hash);
              }
            }
          } else {
            localStorage.removeItem("token");
            const hash = window.location.hash.slice(1);
            if (hash.startsWith("reset-password=") || hash.startsWith("verify-email=")) {
              setCurrentPage(hash);
            }
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          const hash = window.location.hash.slice(1);
          if (hash.startsWith("reset-password=") || hash.startsWith("verify-email=")) {
            setCurrentPage(hash);
          }
        }
      } else {
        // Not logged in, check if there's a product hash to redirect after login
        const hash = window.location.hash.slice(1);
        if (hash.startsWith("product-")) {
          // User needs to login first, but we'll keep the hash
          setCurrentPage("landing");
        } else if (hash.startsWith("reset-password=") || hash.startsWith("verify-email=")) {
          // Navigate to password reset or verify email page
          setCurrentPage(hash);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    if (!userData.name || !userData.department) {
      setCurrentPage("profile");
    } else {
      setCurrentPage("landing");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    setChats([]);
    setCurrentPage("landing");
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const confirmPurchase = async (transactionId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${transactionId}/confirm`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        // Refresh notifications to get the rating prompts
        await fetchNotifications();
        return true;
      } else {
        const err = await response.json();
        console.error("Error confirming purchase:", err.message);
        // If already processed, we still might want to treat it as "done" for the UI part,
        // but for now let's return false and handle specific cases if needed.
        // Actually if it's "Already processed", we should probably return true to let it resolve in UI?
        // Let's just return false and let the caller decide or just keep it simple.
        return false;
      }
    } catch (error) {
      console.error("Error confirming purchase:", error);
      return false;
    }
  };

  const cancelPurchase = async (transactionId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions/${transactionId}/cancel`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        fetchNotifications();
      } else {
        const err = await response.json();
        console.error("Error cancelling purchase:", err.message);
      }
    } catch (error) {
      console.error("Error cancelling purchase:", error);
    }
  };

  const navigateToRating = (transactionId) => {
    // For now, just set the transaction ID for a rating modal
    // This can be enhanced to show a rating modal
    setCurrentPage(`rating-${transactionId}`);
  };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllReadNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/read/all`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !n.read));
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const handleChatRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
      );
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  return (
    <div
      className={`${currentPage.startsWith("product-")
        ? "h-screen overflow-hidden"
        : "min-h-screen"
        } bg-forest-50/30 text-pine-900 font-sans`}
    >
      {/* 頂部導航 - 手機隱藏或简化 */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        unreadCount={unreadCount}
        chatUnreadCount={chatUnreadCount}
        isLoggedIn={isAuthenticated}
        onLogin={handleLogin}
      />

      {/* 主要內容區 */}
      <div
        className={
          currentPage === "chat"
            ? ""
            : currentPage.startsWith("product-")
              ? "h-[calc(100vh-64px)] overflow-hidden"
              : "max-w-6xl mx-auto pb-24 md:pb-8"
        }
      >
        {currentPage === "landing" && (
          <LandingPage
            onNavigateToLogin={() => setCurrentPage("login")}
            isAuthenticated={isAuthenticated}
            onNavigateToHome={() => setCurrentPage("home")}
            onNavigateToPost={() => setCurrentPage("post")}
          />
        )}
        {currentPage === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onBack={() => setCurrentPage("landing")}
          />
        )}
        {currentPage.startsWith("reset-password=") && (
          <ResetPasswordPage
            resetToken={currentPage.split("=")[1]}
            onPasswordResetSuccess={() => {
              // Clear URL hash visually
              window.history.replaceState(null, '', window.location.pathname);
              setCurrentPage("login");
            }}
            onBackToLogin={() => setCurrentPage("login")}
          />
        )}
        {currentPage.startsWith("verify-email=") && (
          <VerifyEmailPage
            verificationToken={currentPage.split("=")[1]}
            onVerified={() => {
              window.history.replaceState(null, '', window.location.pathname);
              setCurrentPage("login");
            }}
            onBackToLogin={() => setCurrentPage("login")}
          />
        )}
        {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === "chat" && (
          <ChatPage
            chats={chats}
            onChatRead={handleChatRead}
            resetKey={chatResetKey}
            onRefreshChats={fetchChats}
            initialChatId={initialChatId}
            onClearInitialChatId={() => setInitialChatId(null)}
            initialProductId={initialProductId}
            onClearInitialProductId={() => setInitialProductId(null)}
            setCurrentPage={setCurrentPage}
            onProductFromChat={(chatId, productId) => {
              setProductBackPage({ type: "chat", chatId });
              setCurrentPage(`product-${productId}`);
            }}
          />
        )}
        {currentPage === "post" && <PostPage setCurrentPage={setCurrentPage} />}
        {currentPage === "notifications" && (
          <NotificationPage
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onConfirmPurchase={confirmPurchase}
            onCancelPurchase={cancelPurchase}
            onNavigateToRating={navigateToRating}
            onDeleteNotification={deleteNotification}
            onDeleteAllRead={deleteAllReadNotifications}
          />
        )}
        {currentPage === "profile" && (
          <ProfilePage
            user={user}
            onLogout={handleLogout}
            setCurrentPage={setCurrentPage}
            onNavigateToProduct={(productId) => {
              setProductBackPage({ type: "profile" });
              setCurrentPage(`product-${productId}`);
            }}
            onNavigateToSeller={(sellerId) => {
              setSellerBackPage({ type: "profile" });
              setCurrentPage(`seller-${sellerId}`);
            }}
            onUserUpdate={setUser}
          />
        )}
        {currentPage.startsWith("product-") && (
          <ProductDetailPage
            productId={currentPage.split("-")[1]}
            setCurrentPage={setCurrentPage}
            onChatCreated={fetchChats}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToSeller={(sellerId, productId) => {
              setSellerBackPage({ type: "product", productId });
              setCurrentPage(`seller-${sellerId}`);
            }}
            productBackPage={productBackPage}
            onClearBackPage={() => setProductBackPage(null)}
          />
        )}
        {currentPage.startsWith("seller-") && (
          <SellerPage
            sellerId={currentPage.split("-")[1]}
            setCurrentPage={setCurrentPage}
            currentUserId={user?.id}
            onProductClick={(productId, sellerId) => {
              setProductBackPage({ type: "seller", sellerId });
              setCurrentPage(`product-${productId}`);
            }}
            sellerBackPage={sellerBackPage}
            onClearBackPage={() => setSellerBackPage(null)}
          />
        )}
        {currentPage.startsWith("rating-") && (
          <RatingPage
            transactionId={currentPage.split("-")[1]}
            setCurrentPage={setCurrentPage}
            user={user}
          />
        )}
      </div>

      {/* 底部導航列 - 只在手機顯示 */}
      {isAuthenticated && (
        <MobileNav
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          unreadCount={unreadCount}
          chatUnreadCount={chatUnreadCount}
        />
      )}
    </div>
  );
}

export default App;
