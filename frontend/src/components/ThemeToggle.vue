<template>
  <div class="theme-toggle">
    <button 
      @click="toggleTheme" 
      class="theme-button" 
      :title="isDark ? '切換到淺色模式' : '切換到深色模式'"
    >
      <span v-if="isDark">☀️</span>
      <span v-else>🌙</span>
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'

export default {
  name: 'ThemeToggle',
  setup() {
    const { toggleTheme, subscribe } = useTheme()
    const isDark = ref(false)
    
    // 訂閱主題變更
    let unsubscribe
    onMounted(() => {
      unsubscribe = subscribe((darkMode) => {
        isDark.value = darkMode
      })
      // 初始化當前主題狀態
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    return {
      isDark,
      toggleTheme
    }
  }
}
</script>

<style>
.theme-toggle {
  display: flex;
  align-items: center;
  position: relative;
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
  position: relative;
  z-index: 1001;
  /* 確保按鈕不會影響其他元素的布局 */
  margin: 0;
  padding: 0;
}

.theme-button:hover {
  border-color: var(--border-hover);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.theme-button:active {
  transform: scale(0.95);
}

.dark-theme .theme-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
