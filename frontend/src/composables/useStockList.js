import { ref, computed } from 'vue'
import { usePostgres } from './usePostgres'

export function useStockList() {
  const { loading, error, executeQuery } = usePostgres()
  const stockList = ref([])
  const searchQuery = ref('')

  // 載入股票清單
  const loadStockList = async () => {
    try {
      const query = `
        SELECT DISTINCT 
          sp.stock_id, 
          sp.stock_name, 
          sp.market,
          mr.industry_type
        FROM tw_stock_price sp
        LEFT JOIN monthly_revenue mr ON sp.stock_id = mr.stock_id
        ORDER BY sp.stock_id
      `
      const result = await executeQuery(query, 3000, 0)
      
      if (result.success) {
        stockList.value = result.data
      } else {
        throw new Error(result.message || '查詢失敗')
      }
    } catch (err) {
      console.error('載入股票清單失敗:', err)
      throw err
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
