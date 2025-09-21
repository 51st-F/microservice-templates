"""
PostgreSQL 連接管理模組
"""

import os
import asyncpg
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL 連接配置
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://airflow:airflow@host.docker.internal:5432/tw_stock")

# 全局連接池
_pool: Optional[asyncpg.Pool] = None

async def get_postgres_connection():
    """
    獲取 PostgreSQL 連接池
    如果連接池不存在則創建新的連接池
    """
    global _pool
    
    if _pool is None:
        try:
            # 解析 PostgreSQL URL
            postgres_url = POSTGRES_URL.replace("postgresql+psycopg2://", "postgresql://")
            
            # 創建連接池
            _pool = await asyncpg.create_pool(
                postgres_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            print("✅ PostgreSQL 連接池創建成功!")
            
        except Exception as e:
            print(f"❌ PostgreSQL 連接池創建失敗: {e}")
            raise e
    
    return _pool

async def get_connection():
    """
    從連接池獲取單個連接
    """
    pool = await get_postgres_connection()
    return await pool.acquire()

async def close_connection(connection):
    """
    歸還連接到連接池
    """
    pool = await get_postgres_connection()
    await pool.release(connection)

async def close_postgres_connection():
    """
    關閉 PostgreSQL 連接池
    """
    global _pool
    
    if _pool is not None:
        await _pool.close()
        _pool = None
        print("PostgreSQL 連接池已關閉")

async def test_connection():
    """
    測試 PostgreSQL 連接
    """
    try:
        pool = await get_postgres_connection()
        async with pool.acquire() as conn:
            # 執行簡單查詢測試連接
            result = await conn.fetchval("SELECT version()")
            return {
                "status": "success",
                "message": "PostgreSQL 連接成功！",
                "database_version": result,
                "connection_string": POSTGRES_URL
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"PostgreSQL 連接失敗: {str(e)}",
            "connection_string": POSTGRES_URL
        }
