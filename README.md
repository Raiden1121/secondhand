# NCU Secondhand Marketplace

中央大學校園二手交易平台。專案包含 React 前端、Express 後端、PostgreSQL 資料庫，以及一組用於碳排放係數整理與商品碳減量估算的 SDGs 腳本。

## Overview

目前專案分成三個部分：

- `src/`：前端應用，使用 React + Vite，採單頁面狀態切換，不使用 React Router。
- `backend/`：REST API、JWT 認證、檔案上傳、Prisma、Socket.IO、排程清理任務。
- `SDGs/`：Python 腳本與 SQLite 資料庫，用於整理碳排放係數資料；後端會透過 Gemini API 與這份資料估算商品的 `carbonSaved`。

## Tech Stack

### Frontend

- React 19
- Vite 7
- Tailwind CSS 3
- lucide-react
- react-i18next
- dnd-kit
- heic2any

### Backend

- Node.js
- Express 5
- Prisma 7
- PostgreSQL
- Socket.IO
- Multer
- Nodemailer
- node-cron
- Google GenAI SDK

### SDGs Tools

- Python
- SQLite
- Playwright
- BeautifulSoup

## Current Features

### Frontend

- Landing page、登入頁、忘記密碼、重設密碼、信箱驗證頁
- 首頁商品瀏覽、分類篩選、學院與系所篩選、模糊搜尋、排序
- 商品詳情頁、賣家頁、個人頁、上架頁
- 收藏、通知、聊天室、評價頁
- 中英文介面切換
- 手機與桌面版介面
- 商品分享連結與以 URL hash 開啟特定商品或驗證流程

### Backend

- 一般註冊登入與 NCU Portal OAuth
- Email 驗證與忘記密碼流程
- 商品 CRUD、圖片上傳、保留狀態切換、已售商品批次清除
- 收藏、檢舉、通知、聊天室、交易確認與評價
- 每日凌晨 3 點自動清理舊訊息與已讀通知
- 商品建立後背景計算碳減量

## Project Structure

```text
secondhand/
├── src/                   # Frontend source
├── public/                # Frontend static assets
├── backend/
│   ├── prisma/            # Prisma schema, migrations, seed
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, upload
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Mail, cleanup, carbon logic
│   │   └── lib/           # Prisma client
│   ├── uploads/           # Uploaded files
│   └── docker-compose.yml # Local PostgreSQL service
├── SDGs/                  # Carbon factor scraper and SQLite DB
└── README.md
```

## Environment Variables

### Frontend `.env`

根目錄的 `.env` 目前使用：

```env
VITE_PORT=5173
VITE_API_URL=http://localhost:3000
```

### Backend `.env`

後端至少需要這些變數：

```env
PORT=3000
DB_PORT=5433
DATABASE_URL=postgresql://user:password@localhost:5433/secondhand?schema=public
JWT_SECRET=replace_me
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORTAL_CLIENT_ID=replace_me
PORTAL_CLIENT_SECRET=replace_me
PORTAL_REDIRECT_URI=http://localhost:3000/api/auth/portal/callback
SMTP_USER=replace_me
SMTP_PASS=replace_me
GEMINI_API_KEY=replace_me
```

說明：

- `DATABASE_URL` 對應 `backend/docker-compose.yml` 內的 PostgreSQL。
- 若 `GEMINI_API_KEY` 未設定，商品仍可建立，但會略過碳減量估算。
- 若 `SMTP_USER` 或 `SMTP_PASS` 不正確，註冊驗證信與重設密碼信將無法正常寄送。

## Local Development

### 1. Install dependencies

根目錄與 `backend/` 都有各自的 `package.json`：

```bash
npm install
cd backend
npm install
```

### 2. Start PostgreSQL with Docker

```bash
cd backend
docker compose up -d
```

說明：

- 本機連接埠使用 `5433`
- 容器內 PostgreSQL 連接埠是 `5432`
- 若出現 `Cannot connect to the Docker daemon`，表示 Docker Desktop 尚未啟動

### 3. Apply Prisma schema

```bash
cd backend
npx prisma db push
```

如果要載入範例資料：

```bash
cd backend
npx prisma db seed
```

如果要查看資料庫內容：

```bash
cd backend
npx prisma studio
```

### 4. Start backend

```bash
cd backend
npm run dev
```

預設服務位置：`http://localhost:3000`

### 5. Start frontend

在另一個 terminal 回到專案根目錄：

```bash
npm run dev
```

預設服務位置：`http://localhost:5173`

## Available Scripts

### Root

- `npm run dev`：啟動 Vite 開發伺服器
- `npm run build`：建置前端
- `npm run preview`：預覽前端建置結果
- `npm run lint`：執行 ESLint

### Backend

- `npm run dev`：以 nodemon 啟動後端
- `npm run start`：以 node 啟動後端

## API Summary

以下為目前 `backend/src/routes/` 實際存在的 API。

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `GET /api/auth/me`
- `PUT /api/auth/update`
- `GET /api/auth/portal`
- `GET /api/auth/portal/callback`
- `GET /api/auth/users/:id`

### Products

- `GET /api/products`
- `GET /api/products/my`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id/reserve`
- `DELETE /api/products/sold/all`
- `DELETE /api/products/:id`

`GET /api/products` 支援：

- `sellerId`
- `excludeUserId`

### Chat

- `GET /api/chat`
- `GET /api/chat/:chatId/messages`
- `POST /api/chat/initiate`
- `POST /api/chat/:chatId/messages`
- `PUT /api/chat/:chatId/read`
- `DELETE /api/chat/:chatId`

### Favorites

- `GET /api/favorites`
- `GET /api/favorites/check/:productId`
- `POST /api/favorites/:productId`
- `DELETE /api/favorites/:productId`

### Notifications

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`
- `DELETE /api/notifications/:id`
- `DELETE /api/notifications/read/all`

### Reports

- `POST /api/reports`

### Transactions

- `GET /api/transactions/carbon-stats`
- `GET /api/transactions/product/:productId/status`
- `POST /api/transactions`
- `PATCH /api/transactions/:transactionId/confirm`
- `PATCH /api/transactions/:transactionId/cancel`
- `GET /api/transactions/:transactionId`

### Ratings

- `POST /api/ratings`
- `GET /api/ratings/user/:userId`
- `GET /api/ratings/transaction/:transactionId/status`

## Database Notes

Prisma schema 目前包含以下模型：

- `User`
- `Product`
- `Chat`
- `Message`
- `Notification`
- `Favorite`
- `Report`
- `Transaction`
- `Rating`

資料庫使用 PostgreSQL；商品圖片、頭像等檔案則存放於 `backend/uploads/`，由後端以 `/uploads` 靜態路徑提供。

## Realtime and Cleanup

- Socket.IO 目前用於聊天室即時訊息轉發
- 後端啟動後會註冊每日 `03:00` 的清理排程
- 清理邏輯位於 [backend/src/services/cleanupService.js](/Users/ray/Desktop/secondhand/backend/src/services/cleanupService.js:1)

## SDGs and Carbon Calculation

`SDGs/` 目錄包含：

- `emission_factors.db`：SQLite 碳排係數資料庫
- `db.py`：資料表初始化與寫入工具
- `scraper.py`：使用 Playwright 抓取台灣碳足跡係數資料
- `requirements.txt`：Python 相依套件

後端商品建立流程會呼叫 [backend/src/services/carbonService.js](/Users/ray/Desktop/secondhand/backend/src/services/carbonService.js:1)：

- 用 Gemini 判斷商品對應的碳排係數分類
- 從 `SDGs/emission_factors.db` 讀取係數
- 將結果回寫到 `Product.carbonSaved`

若你要重新整理碳排資料，需先安裝 `SDGs/requirements.txt` 內的套件，並另外準備 Playwright 瀏覽器環境。
