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
    *   **商品列表**: 瀏覽、搜尋二手商品（目前使用 Mock Data + 部分 API 整合中）。
    *   **個人頁面 (Profile)**:
        *   **帳號設定 (Account Settings)**: 採用 Split Modal UI 設計 (左側棕色吉祥物主題 + 右側編輯表單)，支援修改基本資料（系所、電話、性別等）。
        *   **我的物品**: 管理自己上架的商品。
    *   **響應式設計**: 支援手機與桌面版操作。

### 後端 (Backend)
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **框架**: [Express.js](https://expressjs.com/)
*   **資料庫工具**: [Prisma ORM](https://www.prisma.io/)
*   **認證**: JWT (JSON Web Token) + NCU Portal OAuth 2.0
*   **主要功能**:
    *   **Auth API**: `/api/auth/register`, `/api/auth/login`, `/api/auth/portal` (OAuth), `/api/auth/update` (更新個人資料，支援 bcrypt 密碼加密)。
    *   **Product API**: 支援商品 CRUD (進行中)。
    *   **資料保護**: 設定 `onDelete: Cascade`，當使用者刪除時，自動連動刪除其名下的商品、訊息與通知，確保資料庫完整性。

### 資料庫 (Database)
*   **類型**: [PostgreSQL](https://www.postgresql.org/)
*   **運行方式**: [Docker](https://www.docker.com/) (image: `postgres:15-alpine`)
*   **資料保存**: 設定 Docker Volume (`pgdata`)，即使容器暫停或刪除，資料依然會保存。

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
瀏覽器打開 `http://localhost:5555` 即可：
*   查看所有 Users, Products
*   手動新增/刪除資料 (已支援 Cascade Delete，刪除 User 會一併清除關聯資料)

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
*   [x] 整合 NCU Portal OAuth
*   [x] 完備使用者註冊與登入流程 (含密碼加密)
*   [x] 優化帳號設定 UI (Split Modal + Brown Theme)
*   [x] 解決 User 刪除時的外鍵約束問題 (Foreign Key Constraints)
*   [ ] 完善商品上架與編輯功能的 API 串接
