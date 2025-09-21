"""
PostgreSQL 相關的 API 路由
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import time
import asyncpg
from .connection import get_connection, close_connection, test_connection
from .models import (
    PostgresConnectionTest,
    DatabaseInfo,
    TableInfo,
    TableDetail,
    ColumnInfo,
    QueryResult,
    CreateTableRequest,
    InsertDataRequest,
    UpdateDataRequest,
    DeleteDataRequest,
    CustomQueryRequest
)

postgres_router = APIRouter(prefix="/postgres", tags=["PostgreSQL"])

@postgres_router.get("/test", response_model=PostgresConnectionTest)
async def test_postgres_connection():
    """測試 PostgreSQL 連接"""
    return await test_connection()

@postgres_router.get("/info", response_model=DatabaseInfo)
async def get_database_info():
    """獲取資料庫基本信息"""
    try:
        conn = await get_connection()
        try:
            # 獲取資料庫版本
            version = await conn.fetchval("SELECT version()")
            
            # 獲取當前用戶和資料庫
            current_user = await conn.fetchval("SELECT current_user")
            current_database = await conn.fetchval("SELECT current_database()")
            
            # 獲取所有資料表
            tables_query = """
                SELECT 
                    table_name,
                    table_schema,
                    'BASE TABLE' as table_type
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """
            tables_data = await conn.fetch(tables_query)
            
            tables = []
            for table in tables_data:
                # 獲取每個表的行數
                try:
                    row_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table['table_name']}")
                except:
                    row_count = None
                
                tables.append(TableInfo(
                    table_name=table['table_name'],
                    table_schema=table['table_schema'],
                    table_type=table['table_type'],
                    row_count=row_count
                ))
            
            return DatabaseInfo(
                database_name=current_database,
                database_version=version,
                current_user=current_user,
                current_database=current_database,
                tables=tables
            )
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取資料庫信息失敗: {str(e)}")

@postgres_router.get("/tables", response_model=List[TableInfo])
async def get_tables():
    """獲取所有資料表列表"""
    try:
        conn = await get_connection()
        try:
            query = """
                SELECT 
                    table_name,
                    table_schema,
                    'BASE TABLE' as table_type
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """
            tables_data = await conn.fetch(query)
            
            tables = []
            for table in tables_data:
                try:
                    row_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table['table_name']}")
                except:
                    row_count = None
                
                tables.append(TableInfo(
                    table_name=table['table_name'],
                    table_schema=table['table_schema'],
                    table_type=table['table_type'],
                    row_count=row_count
                ))
            
            return tables
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取資料表列表失敗: {str(e)}")

@postgres_router.get("/tables/{table_name}", response_model=TableDetail)
async def get_table_detail(table_name: str):
    """獲取特定資料表的詳細信息"""
    try:
        conn = await get_connection()
        try:
            # 獲取表信息
            table_info_query = """
                SELECT 
                    table_name,
                    table_schema,
                    'BASE TABLE' as table_type
                FROM information_schema.tables 
                WHERE table_name = $1 AND table_schema = 'public'
            """
            table_data = await conn.fetchrow(table_info_query, table_name)
            
            if not table_data:
                raise HTTPException(status_code=404, detail=f"資料表 {table_name} 不存在")
            
            # 獲取行數
            try:
                row_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table_name}")
            except:
                row_count = None
            
            table_info = TableInfo(
                table_name=table_data['table_name'],
                table_schema=table_data['table_schema'],
                table_type=table_data['table_type'],
                row_count=row_count
            )
            
            # 獲取欄位信息
            columns_query = """
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
            """
            columns_data = await conn.fetch(columns_query, table_name)
            
            columns = []
            for col in columns_data:
                columns.append(ColumnInfo(
                    column_name=col['column_name'],
                    data_type=col['data_type'],
                    is_nullable=col['is_nullable'] == 'YES',
                    column_default=col['column_default'],
                    character_maximum_length=col['character_maximum_length']
                ))
            
            return TableDetail(
                table_info=table_info,
                columns=columns
            )
            
        finally:
            await close_connection(conn)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取資料表詳細信息失敗: {str(e)}")

@postgres_router.post("/query", response_model=QueryResult)
async def execute_custom_query(request: CustomQueryRequest):
    """執行自定義 SQL 查詢"""
    try:
        conn = await get_connection()
        try:
            start_time = time.time()
            
            # 添加 LIMIT 和 OFFSET
            query = request.query.strip()
            if not query.upper().startswith('SELECT'):
                raise HTTPException(status_code=400, detail="只允許執行 SELECT 查詢")
            
            if 'LIMIT' not in query.upper():
                query += f" LIMIT {request.limit}"
            if 'OFFSET' not in query.upper():
                query += f" OFFSET {request.offset}"
            
            # 執行查詢
            rows = await conn.fetch(query)
            
            # 轉換結果
            data = []
            for row in rows:
                data.append(dict(row))
            
            execution_time = time.time() - start_time
            
            return QueryResult(
                success=True,
                message=f"查詢執行成功，返回 {len(data)} 行數據",
                data=data,
                row_count=len(data),
                execution_time=execution_time
            )
            
        finally:
            await close_connection(conn)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查詢執行失敗: {str(e)}")

@postgres_router.post("/tables/create")
async def create_table(request: CreateTableRequest):
    """創建新的資料表"""
    try:
        conn = await get_connection()
        try:
            # 構建 CREATE TABLE 語句
            columns_sql = []
            for col in request.columns:
                columns_sql.append(f"{col['name']} {col['type']}")
            
            create_sql = f"""
                CREATE TABLE {request.schema_name}.{request.table_name} (
                    {', '.join(columns_sql)}
                )
            """
            
            await conn.execute(create_sql)
            
            return {
                "success": True,
                "message": f"資料表 {request.table_name} 創建成功",
                "table_name": request.table_name,
                "schema_name": request.schema_name
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"創建資料表失敗: {str(e)}")

@postgres_router.post("/tables/{table_name}/insert")
async def insert_data(table_name: str, request: InsertDataRequest):
    """向資料表插入數據"""
    try:
        conn = await get_connection()
        try:
            # 構建 INSERT 語句
            columns = list(request.data.keys())
            values = list(request.data.values())
            placeholders = [f"${i+1}" for i in range(len(values))]
            
            insert_sql = f"""
                INSERT INTO {request.schema_name}.{table_name} 
                ({', '.join(columns)}) 
                VALUES ({', '.join(placeholders)})
            """
            
            await conn.execute(insert_sql, *values)
            
            return {
                "success": True,
                "message": f"數據插入到 {table_name} 成功",
                "table_name": table_name,
                "inserted_data": request.data
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"插入數據失敗: {str(e)}")

@postgres_router.put("/tables/{table_name}/update")
async def update_data(table_name: str, request: UpdateDataRequest):
    """更新資料表中的數據"""
    try:
        conn = await get_connection()
        try:
            # 構建 UPDATE 語句
            set_clauses = []
            values = []
            param_count = 1
            
            for key, value in request.data.items():
                set_clauses.append(f"{key} = ${param_count}")
                values.append(value)
                param_count += 1
            
            # 添加 WHERE 子句的參數
            where_values = [f"${param_count}"]
            values.append(request.where_clause)
            
            update_sql = f"""
                UPDATE {request.schema_name}.{table_name} 
                SET {', '.join(set_clauses)}
                WHERE {request.where_clause}
            """
            
            result = await conn.execute(update_sql, *values)
            
            return {
                "success": True,
                "message": f"數據更新成功",
                "table_name": table_name,
                "updated_data": request.data,
                "where_clause": request.where_clause
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新數據失敗: {str(e)}")

@postgres_router.delete("/tables/{table_name}/delete")
async def delete_data(table_name: str, request: DeleteDataRequest):
    """從資料表中刪除數據"""
    try:
        conn = await get_connection()
        try:
            delete_sql = f"""
                DELETE FROM {request.schema_name}.{table_name} 
                WHERE {request.where_clause}
            """
            
            result = await conn.execute(delete_sql)
            
            return {
                "success": True,
                "message": f"數據刪除成功",
                "table_name": table_name,
                "where_clause": request.where_clause
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"刪除數據失敗: {str(e)}")
