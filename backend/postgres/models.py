"""
PostgreSQL 相關的 Pydantic 模型
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ConnectionStatus(str, Enum):
    """連接狀態枚舉"""
    SUCCESS = "success"
    ERROR = "error"

class PostgresConnectionTest(BaseModel):
    """PostgreSQL 連接測試響應模型"""
    status: ConnectionStatus
    message: str
    database_version: Optional[str] = None
    connection_string: str

class TableInfo(BaseModel):
    """資料表信息模型"""
    table_name: str
    table_schema: str
    table_type: str
    row_count: Optional[int] = None

class ColumnInfo(BaseModel):
    """欄位信息模型"""
    column_name: str
    data_type: str
    is_nullable: bool
    column_default: Optional[str] = None
    character_maximum_length: Optional[int] = None

class TableDetail(BaseModel):
    """資料表詳細信息模型"""
    table_info: TableInfo
    columns: List[ColumnInfo]

class DatabaseInfo(BaseModel):
    """資料庫信息模型"""
    database_name: str
    database_version: str
    current_user: str
    current_database: str
    tables: List[TableInfo]

class QueryResult(BaseModel):
    """查詢結果模型"""
    success: bool
    message: str
    data: List[Dict[str, Any]]
    row_count: int
    execution_time: Optional[float] = None

class CreateTableRequest(BaseModel):
    """創建資料表請求模型"""
    table_name: str
    columns: List[Dict[str, str]]  # [{"name": "id", "type": "SERIAL PRIMARY KEY"}, ...]
    schema_name: str = "public"

class InsertDataRequest(BaseModel):
    """插入數據請求模型"""
    table_name: str
    data: Dict[str, Any]
    schema_name: str = "public"

class UpdateDataRequest(BaseModel):
    """更新數據請求模型"""
    table_name: str
    data: Dict[str, Any]
    where_clause: str
    schema_name: str = "public"

class DeleteDataRequest(BaseModel):
    """刪除數據請求模型"""
    table_name: str
    where_clause: str
    schema_name: str = "public"

class CustomQueryRequest(BaseModel):
    """自定義查詢請求模型"""
    query: str
    limit: Optional[int] = 100
    offset: Optional[int] = 0
