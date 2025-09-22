<template>
  <div :class="themeClass">
    <AppHeader />
    
    <main class="app-main">
      <!-- <HelloWorld /> -->
      <MongoDBTest />
      <PostgresManager />
    </main>
  </div>
</template>

<script>
import { useTheme } from './composables/useTheme'
import { useHelloWorld } from './composables/useHelloWorld'
import AppHeader from './components/AppHeader.vue'
import HelloWorld from './components/HelloWorld.vue'
import MongoDBTest from './components/MongoDBTest.vue'
import PostgresManager from './components/PostgresManager.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    HelloWorld,
    MongoDBTest,
    PostgresManager
  },
  setup() {
    const { themeClass, initTheme } = useTheme()
    const { fetchHelloWorld } = useHelloWorld()

    return {
      themeClass,
      initTheme,
      fetchHelloWorld
    }
  },
  async mounted() {
    // 在組件掛載後初始化主題和獲取 Hello World 消息
    this.initTheme()
    await this.fetchHelloWorld()
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

/* 主內容區域 */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .app-main {
    padding: 0 1rem 1rem;
  }
}
</style>