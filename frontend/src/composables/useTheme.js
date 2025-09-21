import { ref, computed } from 'vue'

export function useTheme() {
  const isDark = ref(false)

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
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    // 保存到 localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
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

  return {
    isDark,
    themeClass,
    initTheme,
    toggleTheme,
    applyTheme
  }
}
