<template>
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
      <button @click="handleExecuteQuery" :disabled="loading || !customQuery.trim()" class="btn">
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
</template>

<script>
import { ref } from 'vue'
import { usePostgres } from '../../composables/usePostgres'

export default {
  name: 'CustomQuery',
  setup() {
    const { loading, error, executeQuery } = usePostgres()
    const customQuery = ref('')
    const queryLimit = ref(100)
    const queryOffset = ref(0)
    const queryResult = ref(null)

    const handleExecuteQuery = async () => {
      if (!customQuery.value.trim()) return
      
      try {
        const result = await executeQuery(customQuery.value, queryLimit.value, queryOffset.value)
        queryResult.value = result
      } catch (err) {
        console.error('查詢執行失敗:', err)
      }
    }

    return {
      loading,
      error,
      customQuery,
      queryLimit,
      queryOffset,
      queryResult,
      handleExecuteQuery
    }
  }
}
</script>

<style scoped>
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

.btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--btn-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
  margin: 0.5rem 0.5rem 0.5rem 0;
}

.btn:hover:not(:disabled) {
  background-color: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  background-color: var(--btn-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.dark-theme .btn:hover:not(:disabled) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.result {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
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
  .query-options {
    flex-direction: column;
  }
  
  .input-small {
    width: 100%;
  }
}
</style>
