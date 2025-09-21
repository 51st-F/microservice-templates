import { ref } from 'vue'
import axios from 'axios'

export function useMongoDB() {
  const mongoLoading = ref(false)
  const mongoError = ref(null)
  const mongoResult = ref(null)

  const createSampleMessage = async () => {
    mongoLoading.value = true
    mongoError.value = null
    mongoResult.value = null
    try {
      const response = await axios.post('http://localhost:8000/test-messages/sample')
      mongoResult.value = response.data
      console.log('MongoDB 寫入成功:', response.data)
    } catch (err) {
      mongoError.value = '無法寫入 MongoDB'
      console.error('MongoDB 寫入失敗:', err)
    } finally {
      mongoLoading.value = false
    }
  }

  const fetchTestMessages = async () => {
    mongoLoading.value = true
    mongoError.value = null
    mongoResult.value = null
    try {
      const response = await axios.get('http://localhost:8000/test-messages/')
      mongoResult.value = {
        message: '成功獲取所有測試消息',
        count: response.data.length,
        data: response.data
      }
      console.log('MongoDB 讀取成功:', response.data)
    } catch (err) {
      mongoError.value = '無法從 MongoDB 讀取數據'
      console.error('MongoDB 讀取失敗:', err)
    } finally {
      mongoLoading.value = false
    }
  }

  return {
    mongoLoading,
    mongoError,
    mongoResult,
    createSampleMessage,
    fetchTestMessages
  }
}
