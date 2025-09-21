<template>
  <div class="card">
    <h2>Hello World 測試</h2>
    <p>從後端獲取的消息：</p>
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">錯誤: {{ error }}</div>
    <div v-else>
      <p><strong>消息:</strong> {{ message }}</p>
      <p><strong>時間戳:</strong> {{ timestamp }}</p>
    </div>
    <button @click="fetchHelloWorld" class="btn">重新獲取消息</button>
  </div>
</template>

<script>
import { useHelloWorld } from '../composables/useHelloWorld'

export default {
  name: 'HelloWorld',
  setup() {
    const { message, timestamp, loading, error, fetchHelloWorld } = useHelloWorld()
    
    return {
      message,
      timestamp,
      loading,
      error,
      fetchHelloWorld
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

.card p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
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

.loading {
  color: var(--info-color);
  font-style: italic;
  padding: 0.5rem 0;
}

.error {
  color: var(--error-color);
  background-color: rgba(220, 53, 69, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid var(--error-color);
  margin: 1rem 0;
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
  
  .btn {
    width: 100%;
    margin: 0.25rem 0;
  }
}
</style>
