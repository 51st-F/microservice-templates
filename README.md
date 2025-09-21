# FastAPI + Naive UI 開發環境

這是一個使用 Docker Compose 的完整開發環境，包含：

- **FastAPI 後端**：使用 Poetry 管理依賴的 Python 後端 API
- **Naive UI 前端**：基於 Vue 3 和 Naive UI 的現代前端界面

## 項目結構

```
.
├── backend/                 # FastAPI 後端
│   ├── Dockerfile
│   ├── pyproject.toml      # Poetry 配置文件
│   ├── main.py             # FastAPI 應用主文件
│   ├── env.example         # 環境變量示例
│   └── postgres/           # PostgreSQL 模組
│       ├── __init__.py
│       ├── connection.py   # 連接管理
│       ├── models.py       # Pydantic 模型
│       ├── routers.py      # API 路由
│       └── check_connection.py  # 連接檢查腳本
├── frontend/               # Naive UI 前端
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       └── components/
│           └── PostgresManager.vue  # PostgreSQL 管理組件
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

## 開發說明

### 後端開發

- 使用 Poetry 管理 Python 依賴
- FastAPI 提供自動生成的 API 文檔
- 支持熱重載開發
- 使用 Motor 異步 MongoDB 驅動

### 前端開發

- 使用 Vue 3 + TypeScript
- Naive UI 組件庫
- Vite 構建工具
- 支持熱重載開發
- 內建明暗模式切換功能

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

## 明暗模式功能

### 主題切換

前端應用支援明暗模式切換：

1. **自動檢測**：首次訪問時會自動檢測系統偏好設定
2. **手動切換**：點擊右上角的 🌙/☀️ 按鈕進行切換
3. **記憶功能**：主題偏好會自動保存到瀏覽器本地存儲
4. **平滑過渡**：所有主題切換都有平滑的動畫效果

### 主題特色

- **淺色模式**：清爽的白色背景，適合日間使用
- **深色模式**：護眼的深色背景，適合夜間使用
- **響應式設計**：在手機和桌面設備上都有良好的顯示效果
- **無障礙設計**：保持良好的對比度和可讀性

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
docker-compose logs mongodb
```

### 重新構建

```bash
# 重新構建所有服務
docker-compose up --build

# 重新構建特定服務
docker-compose up --build backend
```

## 技術棧

- **後端**: FastAPI, Poetry, Motor, Pydantic
- **前端**: Vue 3, Naive UI, TypeScript, Vite, Axios
- **容器化**: Docker, Docker Compose
