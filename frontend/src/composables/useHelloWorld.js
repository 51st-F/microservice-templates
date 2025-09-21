import { ref } from 'vue'
import axios from 'axios'

export function useHelloWorld() {
  const message = ref('')
  const timestamp = ref('')
  const loading = ref(false)
  const error = ref(null)

  const fetchHelloWorld = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('http://localhost:8000/hello')
      message.value = response.data.message
      timestamp.value = response.data.timestamp
      console.log('從後端獲取的消息:', response.data)
    } catch (err) {
      error.value = '無法連接到後端服務'
      console.error('API 調用失敗:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    message,
    timestamp,
    loading,
    error,
    fetchHelloWorld
  }
}
