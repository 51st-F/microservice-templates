<template>
  <div class="section">
    <h3>資料庫信息</h3>
    <button @click="handleGetDatabaseInfo" :disabled="loading" class="btn">
      {{ loading ? '載入中...' : '獲取資料庫信息' }}
    </button>
    <div v-if="dbInfo" class="result">
      <div><strong>資料庫名稱:</strong> {{ dbInfo.database_name }}</div>
      <div><strong>當前用戶:</strong> {{ dbInfo.current_user }}</div>
      <div><strong>資料庫版本:</strong> {{ dbInfo.database_version }}</div>
      <div><strong>資料表數量:</strong> {{ dbInfo.tables.length }}</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { usePostgres } from '../../composables/usePostgres'

export default {
  name: 'DatabaseInfo',
  emits: ['database-info'],
  setup(props, { emit }) {
    const { loading, error, getDatabaseInfo } = usePostgres()
    const dbInfo = ref(null)

    const handleGetDatabaseInfo = async () => {
      try {
        const result = await getDatabaseInfo()
        dbInfo.value = result
        emit('database-info', result)
      } catch (err) {
        console.error('獲取資料庫信息失敗:', err)
      }
    }

    return {
      loading,
      error,
      dbInfo,
      handleGetDatabaseInfo
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

.result {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}
</style>
