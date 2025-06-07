# Tickeasy 後台管理系統 - 最終設置步驟

## 1. 安裝必要的 npm 套件

```bash
# 安裝所有必要的依賴
npm install @radix-ui/react-avatar @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-tabs
npm install date-fns sonner
npm install @tanstack/react-table
npm install lucide-react
```

## 2. 更新 package.json

確保在 `package.json` 中加入以下依賴：

```json
{
  "dependencies": {
    // ... 現有的依賴
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@tanstack/react-table": "^8.11.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "sonner": "^1.3.1"
  }
}
```

## 3. 環境變數設置

在 `.env.local` 文件中添加以下變數：

```env
# Supabase (這些應該已經存在)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Endpoint for concert review
NEXT_PUBLIC_API_URL=https://your-api-endpoint.com
```

## 4. 設置 Row Level Security (RLS) 政策

在 Supabase SQL 編輯器中執行以下 SQL：

```sql
-- 啟用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE concert ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

-- Users 表政策
-- 管理員可以查看所有用戶
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role IN ('admin', 'superuser')
        )
    );

-- 超級管理員可以更新用戶角色
CREATE POLICY "Superusers can update user roles" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role = 'superuser'
        )
    );

-- Concert 表政策
-- 管理員可以查看所有演唱會
CREATE POLICY "Admins can view all concerts" ON concert
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role IN ('admin', 'superuser')
        )
    );

-- 管理員可以更新演唱會（審核）
CREATE POLICY "Admins can update concerts" ON concert
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role IN ('admin', 'superuser')
        )
    );

-- Order 表政策
-- 管理員可以查看所有訂單
CREATE POLICY "Admins can view all orders" ON "order"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role IN ('admin', 'superuser')
        )
    );
```

## 5. 創建必要的目錄結構

確保您的專案結構如下：

```
app/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── users/
│       │   └── page.tsx
│       ├── concerts/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       └── page.tsx
│       └── orders/
│           └── page.tsx
├── auth/
│   └── ... (現有的認證頁面)
└── layout.tsx

components/
├── dashboard/
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   └── stats-card.tsx
├── users/
│   ├── user-table.tsx
│   └── role-switcher.tsx
├── concerts/
│   ├── concert-table.tsx
│   ├── concert-filters.tsx
│   ├── concert-stats.tsx
│   └── review-dialog.tsx
├── orders/
│   ├── order-table.tsx
│   └── order-filters.tsx
└── ui/
    ├── avatar.tsx
    ├── dialog.tsx
    ├── select.tsx
    ├── table.tsx
    └── textarea.tsx

lib/
├── types/
│   ├── user.ts
│   ├── concert.ts
│   └── order.ts
└── supabase/
    └── ... (現有的 Supabase 配置)

actions/
├── users.ts
└── concerts.ts
```

## 6. 初始化測試數據（可選）

如果需要測試數據，可以在 Supabase SQL 編輯器中執行：

```sql
-- 創建測試管理員用戶
INSERT INTO users (email, name, role, password)
VALUES 
    ('admin@tickeasy.com', '系統管理員', 'admin', 'hashed_password'),
    ('super@tickeasy.com', '超級管理員', 'superuser', 'hashed_password');

-- 創建測試演唱會數據
INSERT INTO organization (userId, orgName, orgAddress)
SELECT userId, '測試主辦單位', '台北市信義區' 
FROM users WHERE email = 'admin@tickeasy.com';

INSERT INTO concert (organizationId, conTitle, conInfoStatus, reviewStatus)
SELECT organizationId, '測試演唱會 - 待審核', 'reviewing', 'pending'
FROM organization WHERE orgName = '測試主辦單位';
```

## 7. 部署前檢查清單

- [ ] 所有環境變數都已正確設置
- [ ] RLS 政策已經應用
- [ ] 所有必要的 npm 套件已安裝
- [ ] API endpoint 已配置（用於演唱會審核）
- [ ] 至少有一個管理員帳號可以登入

## 8. 本地開發測試

```bash
# 啟動開發服務器
npm run dev

# 訪問後台
http://localhost:3000/dashboard

# 使用管理員帳號登入測試功能
```

## 9. 部署到 Vercel

```bash
# 安裝 Vercel CLI（如果尚未安裝）
npm i -g vercel

# 部署
vercel

# 設置環境變數
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_URL
```

## 10. 後續優化建議

### 性能優化
- 實作數據分頁和虛擬滾動
- 添加數據緩存（使用 React Query 或 SWR）
- 優化圖片加載

### 功能增強
- 添加數據導出功能（CSV/Excel）
- 實作即時通知系統
- 添加數據圖表和分析
- 實作批量操作功能

### 安全性增強
- 實作更細緻的權限控制
- 添加操作日誌記錄
- 實作 IP 白名單
- 添加雙因素認證

## 常見問題排除

### 1. 無法登入後台
- 檢查用戶角色是否為 admin 或 superuser
- 確認 RLS 政策是否正確設置

### 2. 審核 API 調用失敗
- 檢查 NEXT_PUBLIC_API_URL 是否正確設置
- 確認 API endpoint 是否需要認證 token

### 3. 數據無法顯示
- 檢查 Supabase 連接是否正常
- 確認 RLS 政策是否允許查詢
- 檢查瀏覽器控制台是否有錯誤信息

## 聯繫支援

如果遇到任何問題，請檢查：
1. Supabase Dashboard 的錯誤日誌
2. Vercel 的函數日誌
3. 瀏覽器開發者工具的網絡和控制台標籤