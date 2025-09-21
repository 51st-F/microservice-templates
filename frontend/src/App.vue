<template>
  <div :class="themeClass">
    <header class="app-header">
      <h1>前端應用</h1>
      <div class="theme-toggle">
        <button @click="toggleTheme" class="theme-button" :title="isDark ? '切換到淺色模式' : '切換到深色模式'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <!-- Hello World 部分 -->
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

      <!-- MongoDB 測試部分 -->
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

      <!-- PostgreSQL 管理組件 -->
      <PostgresManager />
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import PostgresManager from './components/PostgresManager.vue'

export default {
  name: 'App',
  components: {
    PostgresManager
  },
  data() {
    return {
      message: '',
      timestamp: '',
      loading: false,
      error: null,
      mongoLoading: false,
      mongoError: null,
      mongoResult: null,
      isDark: false
    }
  },
  computed: {
    themeClass() {
      return this.isDark ? 'dark-theme' : 'light-theme'
    }
  },
  async mounted() {
    // 初始化主題
    this.initTheme()
    await this.fetchHelloWorld()
  },
  methods: {
    async fetchHelloWorld() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('http://localhost:8000/hello')
        this.message = response.data.message
        this.timestamp = response.data.timestamp
        console.log('從後端獲取的消息:', response.data)
      } catch (error) {
        this.error = '無法連接到後端服務'
        console.error('API 調用失敗:', error)
      } finally {
        this.loading = false
      }
    },
    async createSampleMessage() {
      this.mongoLoading = true
      this.mongoError = null
      this.mongoResult = null
      try {
        const response = await axios.post('http://localhost:8000/test-messages/sample')
        this.mongoResult = response.data
        console.log('MongoDB 寫入成功:', response.data)
      } catch (error) {
        this.mongoError = '無法寫入 MongoDB'
        console.error('MongoDB 寫入失敗:', error)
      } finally {
        this.mongoLoading = false
      }
    },
    async fetchTestMessages() {
      this.mongoLoading = true
      this.mongoError = null
      this.mongoResult = null
      try {
        const response = await axios.get('http://localhost:8000/test-messages/')
        this.mongoResult = {
          message: '成功獲取所有測試消息',
          count: response.data.length,
          data: response.data
        }
        console.log('MongoDB 讀取成功:', response.data)
      } catch (error) {
        this.mongoError = '無法從 MongoDB 讀取數據'
        console.error('MongoDB 讀取失敗:', error)
      } finally {
        this.mongoLoading = false
      }
    },
    initTheme() {
      // 從 localStorage 讀取主題偏好，如果沒有則使用系統偏好
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDark = savedTheme === 'dark'
      } else {
        // 檢查系統偏好
        this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      this.applyTheme()
    },
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      // 保存到 localStorage
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    applyTheme() {
      // 更新 document 的 class 以支持全局主題
      if (this.isDark) {
        document.documentElement.classList.add('dark-theme')
        document.documentElement.classList.remove('light-theme')
      } else {
        document.documentElement.classList.add('light-theme')
        document.documentElement.classList.remove('dark-theme')
      }
    }
  }
}
</script>

<style>
/* CSS 變量定義 */
:root {
  /* 淺色主題 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --border-hover: #adb5bd;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --btn-primary: #007bff;
  --btn-primary-hover: #0056b3;
  --btn-disabled: #6c757d;
  --success-color: #28a745;
  --error-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
}

/* 深色主題 */
.dark-theme {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-card: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --border-color: #404040;
  --border-hover: #606060;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  --btn-primary: #0d6efd;
  --btn-primary-hover: #0b5ed7;
  --btn-disabled: #6c757d;
  --success-color: #198754;
  --error-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #0dcaf0;
}

/* 全局樣式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 應用容器 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 600;
}

/* 主題切換按鈕 */
.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-button {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.theme-button:hover {
  border-color: var(--border-hover);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.theme-button:active {
  transform: scale(0.95);
}

/* 主內容區域 */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

/* 卡片樣式 */
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

/* 按鈕樣式 */
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

/* 按鈕組 */
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

/* 狀態樣式 */
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

/* 狀態指示器 */
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

/* 響應式設計 */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .app-main {
    padding: 0 1rem 1rem;
  }
  
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

/* 深色主題特殊調整 */
.dark-theme .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-theme .theme-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.dark-theme .btn:hover:not(:disabled) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}
</style>