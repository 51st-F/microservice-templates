<template>
  <div class="section">
    <h3>資料表列表</h3>
    <button @click="handleGetTables" :disabled="loading" class="btn">
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
          <button @click="handleTableDetail(table.table_name)" class="btn-small">詳細信息</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { usePostgres } from '../../composables/usePostgres'

export default {
  name: 'TablesList',
  emits: ['table-detail'],
  setup(props, { emit }) {
    const { loading, error, getTables } = usePostgres()
    const tables = ref([])

    const handleGetTables = async () => {
      try {
        const result = await getTables()
        tables.value = result
      } catch (err) {
        console.error('獲取資料表列表失敗:', err)
      }
    }

    const handleTableDetail = (tableName) => {
      emit('table-detail', tableName)
    }

    return {
      loading,
      error,
      tables,
      handleGetTables,
      handleTableDetail
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

.result {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
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

@media (max-width: 768px) {
  .table-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
