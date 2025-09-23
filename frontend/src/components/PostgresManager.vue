<template>
  <div class="postgres-manager">
    <div class="card">
      <h2>PostgreSQL 資料庫管理</h2>
      
      <!-- 股票清單 -->
      <StockList />

      <!-- 連接測試 -->
      <!-- <ConnectionTest @connection-result="handleConnectionResult" /> -->

      <!-- 資料庫信息 -->
      <!-- <DatabaseInfo @database-info="handleDatabaseInfo" /> -->

      <!-- 資料表列表 -->
      <TablesList @table-detail="handleTableDetail" />

      <!-- 資料表詳細信息 -->
      <TableDetail :table-name="selectedTableName" />

      <!-- 自定義查詢 -->
      <CustomQuery />

      <!-- 錯誤顯示 -->
      <div v-if="error" class="error">
        錯誤: {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  ConnectionTest,
  DatabaseInfo,
  TablesList,
  TableDetail,
  CustomQuery,
  StockList
} from './PostgresManager'

export default {
  name: 'PostgresManager',
  components: {
    ConnectionTest,
    DatabaseInfo,
    TablesList,
    TableDetail,
    CustomQuery,
    StockList
  },
  setup() {
    const error = ref(null)
    const selectedTableName = ref(null)

    const handleConnectionResult = (result) => {
      console.log('連接測試結果:', result)
    }

    const handleDatabaseInfo = (info) => {
      console.log('資料庫信息:', info)
    }

    const handleTableDetail = (tableName) => {
      selectedTableName.value = tableName
    }

    return {
      error,
      selectedTableName,
      handleConnectionResult,
      handleDatabaseInfo,
      handleTableDetail
    }
  }
}
</script>

<style>
.postgres-manager {
  margin-bottom: 2rem;
}

.postgres-manager .card {
  /* background-color: var(--bg-card); */
  /* border: 1px solid var(--border-color); */
  /* border-radius: 12px; */
  padding: 1.5rem;
  margin-bottom: 2rem;
  /* box-shadow: var(--shadow); */
  transition: all 0.3s ease;
}

/* .postgres-manager .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
} */

.postgres-manager .card h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
}

.dark-theme .postgres-manager .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.error {
  color: var(--error-color);
  background-color: rgba(220, 53, 69, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid var(--error-color);
  margin: 1rem 0;
}
</style>
