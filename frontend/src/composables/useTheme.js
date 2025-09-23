import { ref, computed } from 'vue'

// 全局主題狀態
const isDark = ref(false)

// 主題變更監聽器列表
const listeners = new Set()

// 通知所有監聽器主題已變更
const notifyListeners = () => {
  listeners.forEach(listener => listener(isDark.value))
}

export function useTheme() {
  const themeClass = computed(() => {
    return isDark.value ? 'dark-theme' : 'light-theme'
  })

  const initTheme = () => {
    // 從 localStorage 讀取主題偏好，如果沒有則使用系統偏好
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 檢查系統偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
    notifyListeners()
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    // 保存到 localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    notifyListeners()
  }

  const applyTheme = () => {
    // 更新 document 的 class 以支持全局主題
    if (isDark.value) {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    }
  }

  // 訂閱主題變更
  const subscribe = (callback) => {
    listeners.add(callback)
    // 返回取消訂閱函數
    return () => listeners.delete(callback)
  }

  return {
    isDark,
    themeClass,
    initTheme,
    toggleTheme,
    applyTheme,
    subscribe
  }
}
