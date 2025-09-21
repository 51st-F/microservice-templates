#!/usr/bin/env python3
"""
檢查 PostgreSQL 連接的腳本
使用後端 API 來測試 PostgreSQL 連接
"""

import requests
import sys
import json

def check_postgres_connection():
    """通過後端 API 檢查 PostgreSQL 連接"""
    try:
        print("正在通過後端 API 檢查 PostgreSQL 連接...")
        
        # 測試後端 API 連接
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code != 200:
                print("❌ 後端服務未運行")
                print("請先啟動後端服務: docker-compose up -d")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ 無法連接到後端服務 (http://localhost:8000)")
            print("請先啟動後端服務: docker-compose up -d")
            return False
        
        # 測試 PostgreSQL 連接
        response = requests.get("http://localhost:8000/postgres/test", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result['status'] == 'success':
                print("✅ PostgreSQL 連接成功!")
                print(f"資料庫版本: {result['database_version']}")
                print(f"連接字串: {result['connection_string']}")
                return True
            else:
                print(f"❌ PostgreSQL 連接失敗: {result['message']}")
                return False
        else:
            print(f"❌ API 調用失敗: HTTP {response.status_code}")
            print(f"回應內容: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 請求超時，請檢查後端服務狀態")
        return False
    except Exception as e:
        print(f"❌ 發生錯誤: {e}")
        return False

def get_database_info():
    """獲取資料庫詳細信息"""
    try:
        print("\n正在獲取資料庫詳細信息...")
        response = requests.get("http://localhost:8000/postgres/info", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 資料庫信息獲取成功!")
            print(f"資料庫名稱: {result['database_name']}")
            print(f"當前用戶: {result['current_user']}")
            print(f"資料表數量: {len(result['tables'])}")
            
            if result['tables']:
                print("\n資料表列表:")
                for table in result['tables'][:10]:  # 只顯示前10個
                    row_count = f" ({table['row_count']} 行)" if table['row_count'] is not None else ""
                    print(f"  - {table['table_name']}{row_count}")
                if len(result['tables']) > 10:
                    print(f"  ... 還有 {len(result['tables']) - 10} 個資料表")
            
            return True
        else:
            print(f"❌ 獲取資料庫信息失敗: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 獲取資料庫信息失敗: {e}")
        return False

if __name__ == "__main__":
    print("=== PostgreSQL 連接檢查 (通過 API) ===")
    
    # 檢查基本連接
    success = check_postgres_connection()
    
    if success:
        print("\n🎉 PostgreSQL 連接正常！")
        
        # 獲取詳細信息
        get_database_info()
        
        print("\n✅ 所有檢查完成！")
        print("您可以使用前端界面或 API 來管理 PostgreSQL 資料庫。")
    else:
        print("\n💥 PostgreSQL 連接失敗！")
        print("\n請檢查：")
        print("1. 後端服務是否正在運行 (docker-compose up -d)")
        print("2. PostgreSQL 容器是否正在運行")
        print("3. 環境變數配置是否正確")
        sys.exit(1)
