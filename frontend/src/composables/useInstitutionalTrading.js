import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useInstitutionalTrading() {
  const loading = ref(false)
  const error = ref(null)
  const institutionalData = ref([])
  const industryDetails = ref([])
  const selectedIndustry = ref(null)
  const selectedMarket = ref(null)

  // 載入前十大買賣超產業數據
  const loadTopIndustries = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:8000/postgres/institutional-trading/top-industries')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // 合併TSE和TPEX數據
        const combinedData = [
          ...result.data.tse.map(item => ({
            ...item,
            foreign_net_amount: parseFloat(item.foreign_net_amount) || 0,
            investment_trust_net_amount: parseFloat(item.investment_trust_net_amount) || 0,
            dealer_net_amount: parseFloat(item.dealer_net_amount) || 0,
            total_net_amount: parseFloat(item.total_net_amount) || 0,
            stock_count: parseInt(item.stock_count) || 0,
            rank_in_market: parseInt(item.rank_in_market) || 0
          })),
          ...result.data.tpex.map(item => ({
            ...item,
            foreign_net_amount: parseFloat(item.foreign_net_amount) || 0,
            investment_trust_net_amount: parseFloat(item.investment_trust_net_amount) || 0,
            dealer_net_amount: parseFloat(item.dealer_net_amount) || 0,
            total_net_amount: parseFloat(item.total_net_amount) || 0,
            stock_count: parseInt(item.stock_count) || 0,
            rank_in_market: parseInt(item.rank_in_market) || 0
          }))
        ]
        
        institutionalData.value = combinedData
        console.log('三大法人買賣超產業數據載入成功:', combinedData.length, '筆記錄')
      } else {
        throw new Error(result.message || '查詢三大法人買賣超數據失敗')
      }
    } catch (err) {
      console.error('載入三大法人買賣超數據失敗:', err)
      error.value = err.message || '載入三大法人買賣超數據失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 載入特定產業的詳細買賣超標的
  const loadIndustryDetails = async (market, industryType) => {
    loading.value = true
    error.value = null
    try {
      selectedMarket.value = market
      selectedIndustry.value = industryType
      
      const response = await fetch(`http://localhost:8000/postgres/institutional-trading/industry-details/${market}/${encodeURIComponent(industryType)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // 處理數據類型
        const processedData = result.data.map(item => ({
          ...item,
          foreign_net_amount: parseFloat(item.foreign_net_amount) || 0,
          investment_trust_net_amount: parseFloat(item.investment_trust_net_amount) || 0,
          dealer_net_amount: parseFloat(item.dealer_net_amount) || 0,
          total_net_amount: parseFloat(item.total_net_amount) || 0
        }))
        
        industryDetails.value = processedData
        console.log(`${industryType}產業詳細買賣超數據載入成功:`, result.data.length, '筆記錄')
      } else {
        throw new Error(result.message || '查詢產業詳細買賣超數據失敗')
      }
    } catch (err) {
      console.error('載入產業詳細買賣超數據失敗:', err)
      error.value = err.message || '載入產業詳細買賣超數據失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 格式化金額 - 統一顯示為萬單位到小數點第一位
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '-'
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return '-'
    
    // 統一轉換為萬單位，顯示到小數點第一位
    return (numAmount / 10000).toFixed(1) + '萬'
  }

  // 獲取金額樣式類別
  const getAmountClass = (amount) => {
    if (amount === null || amount === undefined) return ''
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return ''
    if (numAmount > 0) return 'positive'
    if (numAmount < 0) return 'negative'
    return 'neutral'
  }

  // 獲取市場中文名稱
  const getMarketName = (market) => {
    return market === 'TSE' ? '上市' : '上櫃'
  }

  // 清除詳細數據
  const clearIndustryDetails = () => {
    industryDetails.value = []
    selectedIndustry.value = null
    selectedMarket.value = null
  }

  return {
    loading,
    error,
    institutionalData,
    industryDetails,
    selectedIndustry,
    selectedMarket,
    loadTopIndustries,
    loadIndustryDetails,
    clearIndustryDetails,
    formatAmount,
    getAmountClass,
    getMarketName
  }
}
