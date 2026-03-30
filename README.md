# NCU Secondhand Marketplace (中央大學二手交易平台)

這是一個專為中央大學學生設計的二手物品交易平台，整合學校 Portal 登入，提供安全便捷的交易環境。

## 🛠 技術架構 (Technology Stack)

### 前端 (Frontend)
*   **框架**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **語言**: JavaScript (JSX)
*   **樣式**: [TailwindCSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **主要功能**:
    *   **NCU Portal OAuth 登入**: 整合校務系統單一登入。
    *   **商品列表**: 瀏覽、搜尋二手商品。
    *   **商品詳情**: 查看商品資訊、賣家資料、聯絡賣家。
    *   **收藏功能**: 加入/移除收藏商品。
    *   **即時聊天**: 與賣家進行對話，支援圖片傳送。
    *   **通知系統**: 接收系統通知並標記已讀。
    *   **個人頁面**: 管理個人資料與上架商品。
    *   **雙語支援 (i18n)**: 支援繁體中文 (zh-TW) 與英文 (en) 介面切換。
    *   **響應式設計**: 支援手機與桌面版操作。

### 後端 (Backend)
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **框架**: [Express.js](https://expressjs.com/)
*   **資料庫工具**: [Prisma ORM](https://www.prisma.io/)
*   **認證**: JWT (JSON Web Token) + NCU Portal OAuth 2.0
*   **檔案上傳**: Multer (支援圖片上傳)

### 資料庫 (Database)
*   **類型**: [PostgreSQL](https://www.postgresql.org/)
*   **運行方式**: [Docker](https://www.docker.com/) (image: `postgres:15-alpine`)
*   **資料保存**: 設定 Docker Volume (`pgdata`)，即使容器暫停或刪除，資料依然會保存。

---

## 📡 API 功能清單 (Backend Features)

### 🔐 認證 (Auth)
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/register` | 用戶註冊 |
| POST | `/api/auth/login` | 用戶登入 |
| GET | `/api/auth/me` | 取得當前用戶資訊 |
| PUT | `/api/auth/update` | 更新個人資料 |
| GET | `/api/auth/portal` | NCU Portal OAuth 登入 |
| GET | `/api/auth/portal/callback` | OAuth 回調處理 |

### 📦 商品 (Product)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/products` | 取得所有商品 (支援 `sellerId`, `excludeUserId` 參數) |
| GET | `/api/products/:id` | 取得單一商品詳情 |
| POST | `/api/products` | 上架新商品 (需登入) |
| GET | `/api/products/my` | 取得我的商品 (需登入) |
| PUT | `/api/products/:id` | 更新商品 (需登入) |
| DELETE | `/api/products/:id` | 刪除商品 (需登入) |
| PATCH | `/api/products/:id/reserve` | 切換商品保留狀態 (需登入) |

### 💬 聊天 (Chat)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/chat` | 取得對話列表 |
| GET | `/api/chat/:chatId/messages` | 取得對話訊息 |
| POST | `/api/chat/initiate` | 開始新對話 |
| POST | `/api/chat/:chatId/messages` | 發送訊息 (支援圖片) |
| PUT | `/api/chat/:chatId/read` | 標記對話已讀 |
| DELETE | `/api/chat/:chatId` | 刪除對話 |

### ❤️ 收藏 (Favorite)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/favorites` | 取得我的收藏 |
| POST | `/api/favorites/:productId` | 加入收藏 |
| DELETE | `/api/favorites/:productId` | 移除收藏 |
| GET | `/api/favorites/:productId/check` | 檢查是否已收藏 |

### 🔔 通知 (Notification)
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/notifications` | 取得所有通知 |
| PUT | `/api/notifications/:id/read` | 標記單則已讀 |
| PUT | `/api/notifications/read-all` | 標記全部已讀 |

### 🚨 檢舉 (Report)
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/reports` | 檢舉商品 |
| GET | `/api/reports` | 取得所有檢舉 (管理員) |

---

## 🚀 如何運行 (How to Run)

### 1. 啟動資料庫 (Database)
確保您已安裝 Docker Desktop。

```bash
cd backend
docker-compose up -d
```

### 2. 初始化資料庫 & 查看資料 (Prisma Studio)
如果第一次運行或 Schema 有變動：
```bash
cd backend
npx prisma db push
```

**⭐️ 推薦：使用可視化介面管理資料庫**
```bash
cd backend
npx prisma studio
```
瀏覽器打開 `http://localhost:5555` (預設)即可：
*   查看所有 Users, Products, Chats, Messages 等
*   手動新增/刪除資料 (已支援 Cascade Delete)

### 3. 啟動後端伺服器 (Backend Server)
```bash
cd backend
npm run dev
```
*   Server 預設運行於 `http://localhost:3000`

### 4. 啟動前端應用 (Frontend App)
開一個新的 Terminal：
```bash
# 回到根目錄 (如果還在 backend)
cd .. 
npm run dev
```
*   App 預設運行於 `http://localhost:5173`

---

## 📝 開發進度筆記

### ✅ 已完成功能
- [x] NCU Portal OAuth 整合
- [x] 用戶註冊/登入系統 (含密碼加密)
- [x] 商品 CRUD (上架、編輯、刪除)
- [x] 商品圖片上傳 (多圖支援、拖曳排序)
- [x] 商品收藏功能
- [x] 即時聊天系統
- [x] 聊天圖片傳送
- [x] 聊天商品卡片分享 (點擊開始對話後，發送第一條訊息會自動附帶商品資訊)
- [x] 商品分享功能 (複製連結到剪貼簿)
- [x] 通知系統
- [x] 商品檢舉功能
- [x] 個人資料編輯 (頭像上傳、裁切功能)
- [x] 響應式設計 (RWD)
- [x] 商品詳情頁面優化 (固定視窗、比例縮放、雙擊放大)
- [x] 智能返回導航 (記住來源頁面：聊天室/個人頁面/首頁)
- [x] URL Hash 導航 (分享連結可直接開啟商品頁面)
- [x] 賣家頁面 (SellerPage) - 查看賣家資訊與商品
- [x] 商品保留功能 (暫保留/取消保留)
- [x] 商品狀態標籤 (已保留/尚未保留)
- [x] 商品排序功能 (價格、收藏數、名稱)
- [x] 首頁隱藏自己的商品
- [x] 聊天室點擊對方頭像跳轉到賣家頁面
- [x] 刪除對話功能
- [x] 交易狀態追蹤
- [x] 推播通知
- [x] **我的物品**：已售出商品自動標記並從首頁隱藏
- [x] **個人頁面**：已售出商品獨立顯示區塊，支援單個/批量刪除
- [x] **收藏管理**：已售出收藏品顯示灰階，支援一鍵取消收藏
- [x] **通知管理**：手動刪除通知功能（單個/批量刪除已讀）
- [x] **搜尋優化**：模糊搜尋（標題、描述、分類），Enter 搜尋，刪除字即時更新
- [x] **自動清理**：每日凌晨3點自動刪除7天前舊訊息與已讀通知
- [x] **全站雙語 (i18n)**：導入 `react-i18next` 支援首頁、登入、聊天、專案頁面等中英雙語動態切換

### 🚧 進行中 / 待開發 / 待優化 (TODO)
- [ ] 管理員後台
- [ ] 推薦系統
- [ ] 瀏覽歷史記錄

---

## 📁 專案結構

```
secondhand/
├── src/                    # 前端原始碼
│   ├── components/         # React 元件
│   ├── pages/              # 頁面元件
│   └── assets/             # 靜態資源
├── backend/
│   ├── src/
│   │   ├── controllers/    # API 控制器
│   │   ├── routes/         # 路由定義
│   │   ├── middleware/     # 中間件 (auth, upload)
│   │   └── lib/            # Prisma client
│   ├── prisma/             # 資料庫 Schema
│   └── uploads/            # 上傳的檔案
└── README.md
```

---

## 📄 License

MIT License
