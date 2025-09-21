<template>
  <div class="postgres-manager">
    <div class="card">
      <h2>PostgreSQL 資料庫管理</h2>
      
      <!-- 連接測試 -->
      <div class="section">
        <h3>連接測試</h3>
        <button @click="testConnection" :disabled="loading" class="btn">
          {{ loading ? '測試中...' : '測試連接' }}
        </button>
        <div v-if="connectionResult" class="result">
          <div :class="['status', connectionResult.status]">
            <strong>狀態:</strong> {{ connectionResult.status === 'success' ? '✅ 成功' : '❌ 失敗' }}
          </div>
          <div><strong>訊息:</strong> {{ connectionResult.message }}</div>
          <div v-if="connectionResult.database_version">
            <strong>資料庫版本:</strong> {{ connectionResult.database_version }}
          </div>
        </div>
      </div>

      <!-- 資料庫信息 -->
      <div class="section">
        <h3>資料庫信息</h3>
        <button @click="getDatabaseInfo" :disabled="loading" class="btn">
          {{ loading ? '載入中...' : '獲取資料庫信息' }}
        </button>
        <div v-if="dbInfo" class="result">
          <div><strong>資料庫名稱:</strong> {{ dbInfo.database_name }}</div>
          <div><strong>當前用戶:</strong> {{ dbInfo.current_user }}</div>
          <div><strong>資料庫版本:</strong> {{ dbInfo.database_version }}</div>
          <div><strong>資料表數量:</strong> {{ dbInfo.tables.length }}</div>
        </div>
      </div>

      <!-- 資料表列表 -->
      <div class="section">
        <h3>資料表列表</h3>
        <button @click="getTables" :disabled="loading" class="btn">
          {{ loading ? '載入中...' : '獲取資料表列表' }}
        </button>
        <div v-if="tables.length > 0" class="result">
          <div class="table-list">
            <div v-for="table in tables" :key="table.table_name" class="table-item">
              <div class="table-name">{{ table.table_name }}</div>
              <div class="table-info">
                <span class="schema">{{ table.table_schema }}</span>
                <span v-if="table.row_count !== null" class="row-count">{{ table.row_count }} 行</span>
              </div>
              <button @click="getTableDetail(table.table_name)" class="btn-small">詳細信息</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 資料表詳細信息 -->
      <div v-if="tableDetail" class="section">
        <h3>資料表詳細信息: {{ tableDetail.table_info.table_name }}</h3>
        <div class="result">
          <div><strong>行數:</strong> {{ tableDetail.table_info.row_count || '未知' }}</div>
          <div><strong>欄位:</strong></div>
          <div class="columns-list">
            <div v-for="column in tableDetail.columns" :key="column.column_name" class="column-item">
              <div class="column-name">{{ column.column_name }}</div>
              <div class="column-type">{{ column.data_type }}</div>
              <div class="column-nullable">{{ column.is_nullable ? '可空' : '不可空' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定義查詢 -->
      <div class="section">
        <h3>自定義查詢</h3>
        <div class="query-form">
          <textarea 
            v-model="customQuery" 
            placeholder="輸入 SQL 查詢語句 (只支援 SELECT 查詢)"
            class="query-input"
            rows="4"
          ></textarea>
          <div class="query-options">
            <input v-model.number="queryLimit" type="number" placeholder="限制行數" min="1" max="1000" class="input-small">
            <input v-model.number="queryOffset" type="number" placeholder="偏移量" min="0" class="input-small">
          </div>
          <button @click="executeQuery" :disabled="loading || !customQuery.trim()" class="btn">
            {{ loading ? '執行中...' : '執行查詢' }}
          </button>
        </div>
        <div v-if="queryResult" class="result">
          <div><strong>執行結果:</strong> {{ queryResult.message }}</div>
          <div v-if="queryResult.execution_time">
            <strong>執行時間:</strong> {{ queryResult.execution_time.toFixed(3) }} 秒
          </div>
          <div v-if="queryResult.data.length > 0" class="query-data">
            <div class="data-table">
              <div class="data-header">
                <div v-for="key in Object.keys(queryResult.data[0])" :key="key" class="data-cell">
                  {{ key }}
                </div>
              </div>
              <div v-for="(row, index) in queryResult.data.slice(0, 10)" :key="index" class="data-row">
                <div v-for="(value, key) in row" :key="key" class="data-cell">
                  {{ value }}
                </div>
              </div>
            </div>
            <div v-if="queryResult.data.length > 10" class="data-more">
              顯示前 10 行，共 {{ queryResult.data.length }} 行數據
            </div>
          </div>
        </div>
      </div>

      <!-- 錯誤顯示 -->
      <div v-if="error" class="error">
        錯誤: {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PostgresManager',
  data() {
    return {
      loading: false,
      error: null,
      connectionResult: null,
      dbInfo: null,
      tables: [],
      tableDetail: null,
      customQuery: '',
      queryLimit: 100,
      queryOffset: 0,
      queryResult: null
    }
  },
  methods: {
    async testConnection() {
      this.loading = true
      this.error = null
      this.connectionResult = null
      try {
        const response = await axios.get('http://localhost:8000/postgres/test')
        this.connectionResult = response.data
      } catch (error) {
        this.error = '無法測試 PostgreSQL 連接'
        console.error('PostgreSQL 連接測試失敗:', error)
      } finally {
        this.loading = false
      }
    },
    async getDatabaseInfo() {
      this.loading = true
      this.error = null
      this.dbInfo = null
      try {
        const response = await axios.get('http://localhost:8000/postgres/info')
        this.dbInfo = response.data
        this.tables = response.data.tables
      } catch (error) {
        this.error = '無法獲取資料庫信息'
        console.error('獲取資料庫信息失敗:', error)
      } finally {
        this.loading = false
      }
    },
    async getTables() {
      this.loading = true
      this.error = null
      this.tables = []
      try {
        const response = await axios.get('http://localhost:8000/postgres/tables')
        this.tables = response.data
      } catch (error) {
        this.error = '無法獲取資料表列表'
        console.error('獲取資料表列表失敗:', error)
      } finally {
        this.loading = false
      }
    },
    async getTableDetail(tableName) {
      this.loading = true
      this.error = null
      this.tableDetail = null
      try {
        const response = await axios.get(`http://localhost:8000/postgres/tables/${tableName}`)
        this.tableDetail = response.data
      } catch (error) {
        this.error = `無法獲取資料表 ${tableName} 的詳細信息`
        console.error('獲取資料表詳細信息失敗:', error)
      } finally {
        this.loading = false
      }
    },
    async executeQuery() {
      if (!this.customQuery.trim()) return
      
      this.loading = true
      this.error = null
      this.queryResult = null
      try {
        const response = await axios.post('http://localhost:8000/postgres/query', {
          query: this.customQuery,
          limit: this.queryLimit,
          offset: this.queryOffset
        })
        this.queryResult = response.data
      } catch (error) {
        this.error = '查詢執行失敗'
        console.error('查詢執行失敗:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.postgres-manager {
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.table-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.table-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.table-name {
  font-weight: 600;
  color: var(--text-primary);
}

.table-info {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.schema {
  background-color: var(--info-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.row-count {
  color: var(--text-secondary);
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  background-color: var(--btn-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-small:hover {
  background-color: var(--btn-primary-hover);
}

.columns-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.column-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  padding: 0.5rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.column-name {
  font-weight: 600;
  color: var(--text-primary);
}

.column-type {
  color: var(--text-secondary);
}

.column-nullable {
  color: var(--info-color);
  font-size: 0.8rem;
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.query-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
}

.query-input:focus {
  outline: none;
  border-color: var(--btn-primary);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.query-options {
  display: flex;
  gap: 1rem;
}

.input-small {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  width: 120px;
}

.query-data {
  margin-top: 1rem;
}

.data-table {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-card);
}

.data-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.data-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  border-top: 1px solid var(--border-color);
}

.data-cell {
  padding: 0.5rem;
  border-right: 1px solid var(--border-color);
  font-size: 0.85rem;
  word-break: break-word;
}

.data-cell:last-child {
  border-right: none;
}

.data-more {
  text-align: center;
  padding: 0.5rem;
  color: var(--text-secondary);
  font-style: italic;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .table-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .query-options {
    flex-direction: column;
  }
  
  .input-small {
    width: 100%;
  }
}
</style>
