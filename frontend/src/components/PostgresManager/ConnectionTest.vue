<template>
  <div class="section">
    <h3>連接測試</h3>
    <button @click="handleTestConnection" :disabled="loading" class="btn">
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
</template>

<script>
import { ref } from 'vue'
import { usePostgres } from '../../composables/usePostgres'

export default {
  name: 'ConnectionTest',
  emits: ['connection-result'],
  setup(props, { emit }) {
    const { loading, error, testConnection } = usePostgres()
    const connectionResult = ref(null)

    const handleTestConnection = async () => {
      try {
        const result = await testConnection()
        connectionResult.value = result
        emit('connection-result', result)
      } catch (err) {
        console.error('連接測試失敗:', err)
      }
    }

    return {
      loading,
      error,
      connectionResult,
      handleTestConnection
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

.status {
  padding: 0.5rem 0;
  font-weight: 500;
}

.status.success {
  color: var(--success-color);
}

.status.error {
  color: var(--error-color);
}
</style>
