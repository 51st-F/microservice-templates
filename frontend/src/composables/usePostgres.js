import { ref } from 'vue'
import axios from 'axios'

export function usePostgres() {
  const loading = ref(false)
  const error = ref(null)

  const apiCall = async (apiFunction) => {
    loading.value = true
    error.value = null
    try {
      const result = await apiFunction()
      return result
    } catch (err) {
      error.value = err.message || '操作失敗'
      console.error('API 調用失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const testConnection = async () => {
    return await apiCall(async () => {
      const response = await axios.get('http://localhost:8000/postgres/test')
      return response.data
    })
  }

  const getDatabaseInfo = async () => {
    return await apiCall(async () => {
      const response = await axios.get('http://localhost:8000/postgres/info')
      return response.data
    })
  }

  const getTables = async () => {
    return await apiCall(async () => {
      const response = await axios.get('http://localhost:8000/postgres/tables')
      return response.data
    })
  }

  const getTableDetail = async (tableName) => {
    return await apiCall(async () => {
      const response = await axios.get(`http://localhost:8000/postgres/tables/${tableName}`)
      return response.data
    })
  }

  const executeQuery = async (query, limit = 100, offset = 0) => {
    return await apiCall(async () => {
      const response = await axios.post('http://localhost:8000/postgres/query', {
        query,
        limit,
        offset
      })
      return response.data
    })
  }

  return {
    loading,
    error,
    testConnection,
    getDatabaseInfo,
    getTables,
    getTableDetail,
    executeQuery
  }
}
