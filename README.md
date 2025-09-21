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
│   └── env.example         # 環境變量示例
├── frontend/               # Naive UI 前端
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.ts
│       └── App.vue
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

## API 端點

- `GET /` - 健康檢查
- `GET /health` - 健康狀態
- `GET /items/` - 獲取所有項目
- `POST /items/` - 創建新項目
- `GET /items/{id}` - 獲取特定項目
- `DELETE /items/{id}` - 刪除項目

## 環境變量

### 後端環境變量

- `MONGODB_URL`: MongoDB 連接字符串

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
