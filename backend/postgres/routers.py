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
            query_upper = query.upper()
            if not (query_upper.startswith('SELECT') or query_upper.startswith('WITH')):
                raise HTTPException(status_code=400, detail="只允許執行 SELECT 或 WITH 查詢")
            
            if 'LIMIT' not in query.upper():
                query += f" LIMIT {request.limit}"
            if 'OFFSET' not in query.upper():
                query += f" OFFSET {request.offset}"
            
            # 執行查詢
            if request.params:
                rows = await conn.fetch(query, *request.params)
            else:
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

@postgres_router.get("/institutional-trading/top-industries")
async def get_top_institutional_trading_industries():
    """獲取上市櫃三大法人買賣超產業及金額"""
    try:
        conn = await get_connection()
        try:
            # 查詢上市三大法人買賣超產業
            tse_query = """
                WITH industry_trading AS (
                    SELECT 
                        COALESCE(mr.industry_type, '未分類') as industry_type,
                        'TSE' as market,
                        SUM(tsi.foreign_excl_dealer_net + tsi.foreign_dealer_net) as foreign_net_amount,
                        SUM(tsi.investment_trust_net) as investment_trust_net_amount,
                        SUM(tsi.dealer_self_net + tsi.dealer_hedge_net) as dealer_net_amount,
                        SUM(tsi.total_net) as total_net_amount,
                        COUNT(DISTINCT tsi.stock_id) as stock_count
                    FROM twse_stock_insti tsi
                    LEFT JOIN (
                        SELECT DISTINCT ON (stock_id)
                            stock_id, industry_type, report_month
                        FROM monthly_revenue
                        ORDER BY stock_id, report_month DESC
                    ) mr ON tsi.stock_id = mr.stock_id
                    WHERE tsi.trade_date = (SELECT MAX(trade_date) FROM twse_stock_insti)
                    AND tsi.stock_id NOT LIKE '00%'
                    GROUP BY COALESCE(mr.industry_type, '未分類')
                )
                SELECT 
                    industry_type,
                    market,
                    foreign_net_amount,
                    investment_trust_net_amount,
                    dealer_net_amount,
                    total_net_amount,
                    stock_count,
                    ROW_NUMBER() OVER (ORDER BY ABS(total_net_amount) DESC) as rank_in_market
                FROM industry_trading
                ORDER BY ABS(total_net_amount) DESC
            """
            
            # 查詢上櫃三大法人買賣超產業
            tpex_query = """
                WITH industry_trading AS (
                    SELECT 
                        COALESCE(mr.industry_type, '未分類') as industry_type,
                        'TPEX' as market,
                        SUM(tsi.foreign_net) as foreign_net_amount,
                        SUM(tsi.investment_trust_net) as investment_trust_net_amount,
                        SUM(tsi.dealer_net) as dealer_net_amount,
                        SUM(tsi.total_net) as total_net_amount,
                        COUNT(DISTINCT tsi.stock_id) as stock_count
                    FROM tpex_stock_insti tsi
                    LEFT JOIN (
                        SELECT DISTINCT ON (stock_id)
                            stock_id, industry_type, report_month
                        FROM monthly_revenue
                        ORDER BY stock_id, report_month DESC
                    ) mr ON tsi.stock_id = mr.stock_id
                    WHERE tsi.trade_date = (SELECT MAX(trade_date) FROM tpex_stock_insti)
                    AND tsi.stock_id NOT LIKE '00%'
                    GROUP BY COALESCE(mr.industry_type, '未分類')
                )
                SELECT 
                    industry_type,
                    market,
                    foreign_net_amount,
                    investment_trust_net_amount,
                    dealer_net_amount,
                    total_net_amount,
                    stock_count,
                    ROW_NUMBER() OVER (ORDER BY ABS(total_net_amount) DESC) as rank_in_market
                FROM industry_trading
                ORDER BY ABS(total_net_amount) DESC
            """
            
            # 執行查詢
            tse_data = await conn.fetch(tse_query)
            tpex_data = await conn.fetch(tpex_query)
            
            # 轉換結果
            tse_result = [dict(row) for row in tse_data]
            tpex_result = [dict(row) for row in tpex_data]
            
            return {
                "success": True,
                "message": "獲取三大法人買賣超產業成功",
                "data": {
                    "tse": tse_result,
                    "tpex": tpex_result
                }
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取三大法人買賣超產業失敗: {str(e)}")

@postgres_router.get("/institutional-trading/industry-details/{market}/{industry_type}")
async def get_industry_trading_details(market: str, industry_type: str):
    """獲取特定產業的詳細買賣超標的內容"""
    try:
        conn = await get_connection()
        try:
            # 根據市場選擇對應的表
            table_name = "twse_stock_insti" if market.upper() == "TSE" else "tpex_stock_insti"
            
            # 根據市場選擇不同的欄位名稱
            if market.upper() == "TSE":
                query = f"""
                    SELECT 
                        tsi.stock_id,
                        tsi.stock_name,
                        tsi.foreign_excl_dealer_net + tsi.foreign_dealer_net as foreign_net_amount,
                        tsi.investment_trust_net as investment_trust_net_amount,
                        tsi.dealer_self_net + tsi.dealer_hedge_net as dealer_net_amount,
                        tsi.total_net as total_net_amount,
                        tsi.trade_date
                    FROM {table_name} tsi
                    LEFT JOIN (
                        SELECT DISTINCT ON (stock_id)
                            stock_id, industry_type, report_month
                        FROM monthly_revenue
                        ORDER BY stock_id, report_month DESC
                    ) mr ON tsi.stock_id = mr.stock_id
                    WHERE tsi.trade_date = (SELECT MAX(trade_date) FROM {table_name})
                    AND COALESCE(mr.industry_type, '未分類') = $1
                    AND tsi.stock_id NOT LIKE '00%'
                    ORDER BY ABS(tsi.total_net) DESC
                """
            else:  # TPEX
                query = f"""
                    SELECT 
                        tsi.stock_id,
                        tsi.stock_name,
                        tsi.foreign_net as foreign_net_amount,
                        tsi.investment_trust_net as investment_trust_net_amount,
                        tsi.dealer_net as dealer_net_amount,
                        tsi.total_net as total_net_amount,
                        tsi.trade_date
                    FROM {table_name} tsi
                    LEFT JOIN (
                        SELECT DISTINCT ON (stock_id)
                            stock_id, industry_type, report_month
                        FROM monthly_revenue
                        ORDER BY stock_id, report_month DESC
                    ) mr ON tsi.stock_id = mr.stock_id
                    WHERE tsi.trade_date = (SELECT MAX(trade_date) FROM {table_name})
                    AND COALESCE(mr.industry_type, '未分類') = $1
                    AND tsi.stock_id NOT LIKE '00%'
                    ORDER BY ABS(tsi.total_net) DESC
                """
            
            rows = await conn.fetch(query, industry_type)
            
            # 轉換結果
            data = [dict(row) for row in rows]
            
            return {
                "success": True,
                "message": f"獲取{industry_type}產業詳細買賣超成功",
                "data": data,
                "industry_type": industry_type,
                "market": market
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取產業詳細買賣超失敗: {str(e)}")

@postgres_router.get("/industry-analysis")
async def get_industry_analysis():
    """獲取產業分析數據"""
    try:
        conn = await get_connection()
        try:
            query = """
                SELECT 
                  COALESCE(mr.industry_type, '未分類') as industry_type,
                  COALESCE(sp.market, '未分類') as market,
                  COUNT(DISTINCT sp.stock_id) as stock_count,
                  CASE 
                    WHEN SUM(sp.open) > 0 
                    THEN ROUND(((SUM(sp.close) - SUM(sp.open)) / SUM(sp.open)) * 100, 2)
                    ELSE 0 
                  END as avg_change_percent,
                  COALESCE(SUM(sp.shares), 0) as total_volume
                FROM tw_stock_price sp
                LEFT JOIN (
                  SELECT DISTINCT ON (stock_id)
                      stock_id, industry_type, report_month
                  FROM monthly_revenue
                  ORDER BY stock_id, report_month DESC
                ) mr ON sp.stock_id = mr.stock_id
                WHERE sp.trade_date = (SELECT MAX(trade_date) FROM tw_stock_price)
                AND sp.stock_id NOT LIKE '00%'
                GROUP BY COALESCE(mr.industry_type, '未分類'), COALESCE(sp.market, '未分類')
                ORDER BY total_volume DESC
            """
            
            rows = await conn.fetch(query)
            
            # 轉換結果
            data = []
            for row in rows:
                data.append({
                    'industry_type': row['industry_type'],
                    'market': row['market'],
                    'stock_count': int(row['stock_count']),
                    'avg_change_percent': float(row['avg_change_percent']) if row['avg_change_percent'] else 0,
                    'total_volume': float(row['total_volume']) if row['total_volume'] else 0
                })
            
            return {
                "success": True,
                "message": "獲取產業分析數據成功",
                "data": data
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取產業分析數據失敗: {str(e)}")

@postgres_router.get("/stock-list")
async def get_stock_list():
    """獲取股票清單"""
    try:
        conn = await get_connection()
        try:
            query = """
                SELECT DISTINCT 
                  sp.stock_id, 
                  sp.stock_name, 
                  sp.market,
                  mr.industry_type
                FROM tw_stock_price sp
                LEFT JOIN monthly_revenue mr ON sp.stock_id = mr.stock_id
                ORDER BY sp.stock_id
            """
            
            rows = await conn.fetch(query)
            
            # 轉換結果
            data = [dict(row) for row in rows]
            
            return {
                "success": True,
                "message": "獲取股票清單成功",
                "data": data
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取股票清單失敗: {str(e)}")

@postgres_router.get("/stock-chart/{stock_id}")
async def get_stock_chart_data(stock_id: str):
    """獲取股票K線圖數據"""
    try:
        conn = await get_connection()
        try:
            query = """
                SELECT trade_date, open, close, high, low, shares 
                FROM tw_stock_price 
                WHERE stock_id = $1 
                ORDER BY trade_date DESC
            """
            
            rows = await conn.fetch(query, stock_id)
            
            # 轉換結果
            data = [dict(row) for row in rows]
            
            return {
                "success": True,
                "message": f"獲取股票 {stock_id} K線數據成功",
                "data": data,
                "stock_id": stock_id
            }
            
        finally:
            await close_connection(conn)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取股票K線數據失敗: {str(e)}")