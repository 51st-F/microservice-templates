FROM python:3.11-slim

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Poetry
RUN pip install --upgrade pip && \
    pip install poetry==1.7.1

# 設置工作目錄
WORKDIR /app

# 配置 Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    POETRY_VIRTUALENVS_CREATE=false

# 複製 Poetry 配置文件
COPY pyproject.toml ./

# 安裝依賴
RUN poetry install --no-dev --no-interaction --no-root

# 複製應用代碼
COPY . .

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
