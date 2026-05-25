import React from "react";
import { Home, MessageCircle, Plus, Bell, User } from "lucide-react";
import { useTranslation } from "react-i18next";

const MobileNav = ({
  currentPage,
  setCurrentPage,
  unreadCount,
  chatUnreadCount,
}) => {
  const { t } = useTranslation();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pine-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-safe">
      <div className="flex justify-around items-end pt-2 pb-2">
        {/* 1. 首頁 */}
        <button
          onClick={() => setCurrentPage("home")}
          className={`flex-1 flex flex-col items-center transition ${
            currentPage === "home"
              ? "text-pine-800"
              : "text-pine-400 hover:text-pine-600"
          }`}
        >
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">{t("nav.home")}</span>
        </button>

        {/* 2. 對話 (已刪除重複的按鈕，保留動態數字這個) */}
        <button
          onClick={() => setCurrentPage("chat")}
          className={`flex-1 flex flex-col items-center transition relative ${
            currentPage === "chat"
              ? "text-pine-800"
              : "text-pine-400 hover:text-pine-600"
          }`}
        >
          {/* 將 Icon 與紅點包在一起，確保紅點定位不會因為螢幕變寬而跑掉 */}
          <div className="relative">
            <MessageCircle size={24} />
            {chatUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-stone-800 text-white text-[10px] rounded-full flex items-center justify-center">
                {chatUnreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">{t("nav.chat")}</span>
        </button>

        {/* 3. 分享 (中間突出按鈕，保留原本的設計與動畫) */}
        <button
          onClick={() => setCurrentPage("post")}
          className="flex-1 flex flex-col items-center -mt-6"
        >
          <div className="w-14 h-14 bg-pine-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pine-700 transition ring-4 ring-white">
            <Plus size={28} />
          </div>
          <span className="text-[10px] text-pine-600 mt-1 font-medium">
            {t("nav.post")}
          </span>
        </button>

        {/* 4. 通知 */}
        <button
          onClick={() => setCurrentPage("notifications")}
          className={`flex-1 flex flex-col items-center transition relative ${
            currentPage === "notifications"
              ? "text-pine-800"
              : "text-pine-400 hover:text-pine-600"
          }`}
        >
          <div className="relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-stone-800 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">
            {t("nav.notifications")}
          </span>
        </button>

        {/* 5. 我的 */}
        <button
          onClick={() => setCurrentPage("profile")}
          className={`flex-1 flex flex-col items-center transition ${
            currentPage === "profile"
              ? "text-pine-800"
              : "text-pine-400 hover:text-pine-600"
          }`}
        >
          <User size={24} />
          <span className="text-[10px] mt-1 font-medium">
            {t("nav.profile")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
