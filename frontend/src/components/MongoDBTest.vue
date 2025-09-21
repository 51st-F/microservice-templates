<template>
  <div class="card">
    <h2>MongoDB 測試</h2>
    <div class="button-group">
      <button @click="createSampleMessage" :disabled="mongoLoading" class="btn">
        {{ mongoLoading ? '寫入中...' : '創建示例消息到 MongoDB' }}
      </button>
      <button @click="fetchTestMessages" :disabled="mongoLoading" class="btn">
        {{ mongoLoading ? '載入中...' : '獲取所有測試消息' }}
      </button>
    </div>
    
    <div v-if="mongoError" class="error">
      錯誤: {{ mongoError }}
    </div>
    
    <div v-if="mongoResult" class="result">
      <h3>結果:</h3>
      <pre>{{ JSON.stringify(mongoResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { useMongoDB } from '../composables/useMongoDB'

export default {
  name: 'MongoDBTest',
  setup() {
    const { mongoLoading, mongoError, mongoResult, createSampleMessage, fetchTestMessages } = useMongoDB()
    
    return {
      mongoLoading,
      mongoError,
      mongoResult,
      createSampleMessage,
      fetchTestMessages
    }
  }
}
</script>

<style>
.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card h2 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
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

.error {
  color: var(--error-color);
  background-color: rgba(220, 53, 69, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid var(--error-color);
  margin: 1rem 0;
}

.result {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}

.result h3 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.result pre {
  background-color: var(--bg-primary);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.4;
  border: 1px solid var(--border-color);
}

.dark-theme .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-theme .btn:hover:not(:disabled) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    margin: 0.25rem 0;
  }
}
</style>
