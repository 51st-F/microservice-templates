# 微服務模板 - FastAPI + Vue 3 全棧開發環境

這是一個完整的微服務開發模板，包含模組化的前端架構和功能完整的後端 API。

## 項目結構

```
.
├── backend/                 # FastAPI 後端
│   ├── Dockerfile
│   ├── pyproject.toml      # Poetry 依賴管理
│   ├── main.py             # FastAPI 應用主文件
│   ├── env.example         # 環境變量示例
│   └── postgres/           # PostgreSQL 模組
│       ├── __init__.py
│       ├── connection.py   # 連接管理
│       ├── models.py       # Pydantic 模型
│       ├── routers.py      # API 路由
│       └── check_connection.py  # 連接檢查腳本
├── frontend/               # Vue 3 前端（模組化架構）
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.vue         # 主應用組件
│       ├── main.ts
│       ├── components/     # 組件目錄
│       │   ├── AppHeader.vue      # 應用標題和主題切換
│       │   ├── HelloWorld.vue     # Hello World 測試組件
│       │   ├── MongoDBTest.vue    # MongoDB 測試組件
│       │   ├── PostgresManager.vue # PostgreSQL 管理組件（主組件）
│       │   ├── PostgresManager/   # PostgreSQL 模組化子組件
│       │   │   ├── ConnectionTest.vue    # 資料庫連接測試
│       │   │   ├── DatabaseInfo.vue      # 資料庫基本信息顯示
│       │   │   ├── TablesList.vue        # 資料表列表顯示
│       │   │   ├── TableDetail.vue       # 資料表詳細信息顯示
│       │   │   ├── CustomQuery.vue       # 自定義 SQL 查詢
│       │   │   ├── index.js              # 組件導出文件
│       │   │   └── README.md             # 模組化組件文檔
│       │   └── ThemeToggle.vue    # 主題切換組件
│       └── composables/    # 組合式函數目錄
│           ├── useTheme.js        # 主題管理邏輯
│           ├── useHelloWorld.js   # Hello World API 邏輯
│           ├── useMongoDB.js      # MongoDB API 邏輯
│           └── usePostgres.js     # PostgreSQL API 邏輯
├── docker-compose.yml      # Docker Compose 配置
└── README.md
```

## 快速開始

### 1. 啟動所有服務

```bash
docker-compose up -d
```

### 2. 訪問應用

- **前端界面**: http://localhost:3000
- **後端 API**: http://localhost:8000
- **API 文檔**: http://localhost:8000/docs

### 3. 停止服務

```bash
docker-compose down
```

### 4. 清理數據（包括數據庫）

```bash
docker-compose down -v
```

## 技術特色

### 後端特色
- **FastAPI**：現代化的 Python Web 框架，自動生成 API 文檔
- **Poetry**：依賴管理和虛擬環境管理
- **異步支持**：使用 Motor 異步 MongoDB 驅動
- **模組化設計**：清晰的代碼結構和職責分離

### 前端特色
- **Vue 3 + Composition API**：現代化的響應式框架
- **模組化架構**：組件和 composables 分離，提高可維護性
- **TypeScript**：類型安全的開發體驗
- **Vite**：快速的構建工具和熱重載
- **主題系統**：完整的明暗模式支持，自動記憶用戶偏好

## API 端點

- `GET /` - 健康檢查
- `GET /health` - 健康狀態
- `GET /hello` - Hello World 測試
- `GET /postgres/test` - PostgreSQL 連接測試
- `GET /postgres/info` - 獲取資料庫基本信息
- `GET /postgres/tables` - 獲取所有資料表列表
- `GET /postgres/tables/{table_name}` - 獲取特定資料表詳細信息
- `POST /postgres/query` - 執行自定義 SQL 查詢
- `POST /postgres/tables/create` - 創建新的資料表
- `POST /postgres/tables/{table_name}/insert` - 向資料表插入數據
- `PUT /postgres/tables/{table_name}/update` - 更新資料表中的數據
- `DELETE /postgres/tables/{table_name}/delete` - 從資料表中刪除數據
- `GET /items/` - 獲取所有項目
- `POST /items/` - 創建新項目
- `GET /items/{id}` - 獲取特定項目
- `DELETE /items/{id}` - 刪除項目
- `GET /test-messages/` - 獲取測試消息
- `POST /test-messages/` - 創建測試消息
- `POST /test-messages/sample` - 創建示例測試消息

## 環境變量

### 後端環境變量

- `MONGODB_URL`: MongoDB 連接字符串
- `POSTGRES_URL`: PostgreSQL 連接字符串

## 資料庫測試功能

### PostgreSQL 連接測試

前端界面提供了 PostgreSQL 連接測試功能：

1. 訪問 http://localhost:3000
2. 點擊 "測試 PostgreSQL 連接" 按鈕
3. 查看連接狀態和資料庫版本信息

### 手動測試 PostgreSQL 連接

```bash
# 1. 啟動後端服務
docker-compose up -d

# 2. 檢查 PostgreSQL 連接 (通過 API)
python backend/postgres/check_connection.py

# 3. 直接測試 API 端點
curl http://localhost:8000/postgres/test
curl http://localhost:8000/postgres/info
```

### PostgreSQL 管理功能

前端提供了完整的 PostgreSQL 管理界面：

1. **連接測試**：測試與 PostgreSQL 的連接狀態
2. **資料庫信息**：查看資料庫基本信息、版本、用戶等
3. **資料表管理**：瀏覽所有資料表，查看行數和結構
4. **資料表詳情**：查看特定資料表的欄位信息
5. **自定義查詢**：執行 SQL 查詢（僅支援 SELECT 語句）
6. **實時結果**：查詢結果以表格形式顯示，支援分頁

### 資料庫配置

#### 連接到本地現有的 PostgreSQL 容器

如果您本地已經有運行中的 PostgreSQL 容器，請確保：

1. **容器端口映射**：確保 PostgreSQL 容器將端口 5432 映射到宿主機
   ```bash
   # 例如：docker run -p 5432:5432 postgres:15
   ```

2. **資料庫配置**：確保您的 PostgreSQL 容器有以下配置：
   - **用戶名**: airflow
   - **密碼**: airflow  
   - **資料庫**: tw_stock
   - **端口**: 5432

3. **環境變數**：複製 `env.example` 到 `env` 並確認連接字串：
   ```bash
   cp backend/env.example backend/.env
   ```

#### 使用 Docker Compose 中的 PostgreSQL

如果您想使用 Docker Compose 中的 PostgreSQL，請取消註釋 `docker-compose.yml` 中的 PostgreSQL 服務。

## 前端模組化架構

### 組件設計
- **AppHeader**：應用標題和主題切換
- **HelloWorld**：後端連接測試組件
- **MongoDBTest**：MongoDB 功能測試組件
- **PostgresManager**：完整的 PostgreSQL 管理界面（主組件）
- **ThemeToggle**：可重用的主題切換組件

### PostgresManager 模組化子組件
- **ConnectionTest**：資料庫連接測試功能
- **DatabaseInfo**：資料庫基本信息顯示
- **TablesList**：資料表列表顯示和管理
- **TableDetail**：資料表詳細信息顯示
- **CustomQuery**：自定義 SQL 查詢功能

### Composables（組合式函數）
- **useTheme**：主題狀態管理和切換邏輯
- **useHelloWorld**：Hello World API 調用邏輯
- **useMongoDB**：MongoDB API 調用邏輯
- **usePostgres**：PostgreSQL API 調用邏輯（統一管理所有資料庫操作）

### 主題系統
- **自動檢測**：首次訪問時檢測系統偏好
- **手動切換**：右上角 🌙/☀️ 按鈕
- **持久化**：主題偏好保存到 localStorage
- **響應式**：支持手機和桌面設備

## PostgresManager 模組化組件

### 組件結構
PostgresManager 採用模組化設計，將原本的大型組件拆分為多個功能專一的小組件：

#### 主要組件
- **PostgresManager.vue** - 主組件，協調所有子組件

#### 子組件
- **ConnectionTest.vue** - 資料庫連接測試
- **DatabaseInfo.vue** - 資料庫基本信息顯示
- **TablesList.vue** - 資料表列表顯示
- **TableDetail.vue** - 資料表詳細信息顯示
- **CustomQuery.vue** - 自定義 SQL 查詢

#### 共享資源
- **usePostgres.js** - 共享的 composable，包含所有 API 調用邏輯
- **index.js** - 組件導出文件

### 使用方式

```vue
<template>
  <PostgresManager />
</template>

<script>
import PostgresManager from '@/components/PostgresManager.vue'

export default {
  components: {
    PostgresManager
  }
}
</script>
```

### 組件通信
- 子組件通過 `emit` 向父組件傳遞事件
- 父組件通過 `props` 向子組件傳遞數據
- 所有 API 調用邏輯統一在 `usePostgres` composable 中

### 樣式設計
每個組件都有自己的 scoped 樣式，主組件只保留必要的容器樣式，確保樣式隔離和可維護性。

## 開發優勢

### 模組化設計
- **可維護性**：每個功能模組獨立，易於維護和修改
- **可重用性**：組件和 composables 可在其他項目中重用
- **可測試性**：獨立的模組更容易進行單元測試
- **代碼組織**：清晰的目錄結構和職責分離

#### PostgresManager 模組化優勢
- **組件分離**：將大型組件拆分為功能專一的小組件
- **邏輯共享**：通過 `usePostgres` composable 統一管理 API 調用
- **樣式隔離**：每個子組件都有獨立的 scoped 樣式
- **事件通信**：子組件通過 emit 與父組件通信，保持鬆耦合
- **易於擴展**：新增功能只需添加新的子組件

### 開發體驗
- **熱重載**：前後端都支持熱重載開發
- **類型安全**：TypeScript 提供完整的類型檢查
- **自動文檔**：FastAPI 自動生成 API 文檔
- **Docker化**：一鍵啟動完整的開發環境

## 故障排除

### 常見問題
1. **端口衝突**: 確保 3000、8000、27018 端口未被占用
2. **權限問題**: 在 Linux/Mac 上可能需要使用 `sudo`
3. **網絡問題**: 確保 Docker 網絡正常工作

### 查看日誌
```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs backend
docker-compose logs frontend
```

### 重新構建
```bash
# 重新構建所有服務
docker-compose up --build

# 重新構建特定服務
docker-compose up --build backend
```

## 技術棧

- **後端**: FastAPI, Poetry, Motor, Pydantic, PostgreSQL
- **前端**: Vue 3, TypeScript, Vite, Axios, CSS Variables
- **容器化**: Docker, Docker Compose
