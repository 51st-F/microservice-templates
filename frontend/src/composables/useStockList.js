import { ref, computed } from 'vue'
import axios from 'axios'

export function useStockList() {
  const loading = ref(false)
  const error = ref(null)
  const stockList = ref([])
  const searchQuery = ref('')

  // 載入股票清單
  const loadStockList = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('http://localhost:8000/postgres/stock-list')
      
      if (response.data.success) {
        stockList.value = response.data.data
      } else {
        throw new Error(response.data.message || '查詢失敗')
      }
    } catch (err) {
      error.value = err.message || '載入股票清單失敗'
      console.error('載入股票清單失敗:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 過濾股票清單
  const filteredStocks = computed(() => {
    if (!searchQuery.value.trim()) {
      return []
    }
    
    const query = searchQuery.value.toLowerCase().trim()
    return stockList.value.filter(stock => 
      stock.stock_id.toLowerCase().includes(query) || 
      stock.stock_name.toLowerCase().includes(query) ||
      (stock.market && stock.market.toLowerCase().includes(query)) ||
      (stock.industry_type && stock.industry_type.toLowerCase().includes(query))
    )
  })

  // 清除搜尋
  const clearSearch = () => {
    searchQuery.value = ''
  }

  return {
    loading,
    error,
    stockList,
    searchQuery,
    filteredStocks,
    loadStockList,
    clearSearch
  }
}
