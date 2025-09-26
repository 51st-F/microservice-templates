import { ref, computed } from 'vue'
import axios from 'axios'

export function useIndustryComprehensive() {
  const loading = ref(false)
  const error = ref(null)
  const institutionalData = ref([])
  const performanceData = ref([])
  const industryDetails = ref([])
  const selectedIndustry = ref(null)
  const selectedMarket = ref(null)
  
  // 日期相關
  const selectedDate = ref('')
  const maxDate = ref(getTodayDate())

  // 獲取今天日期的字符串格式
  function getTodayDate() {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // 獲取最新交易日期
  const loadLatestTradeDate = async () => {
    try {
      const response = await axios.get('http://localhost:8000/postgres/latest-trade-date')
      
      if (response.data.success && response.data.data) {
        const latestDate = response.data.data.latest_trade_date
        selectedDate.value = latestDate
        console.log('最新交易日期載入成功:', latestDate)
      } else {
        // 如果沒有找到交易日期，使用今天的日期
        selectedDate.value = getTodayDate()
        console.log('未找到交易日期，使用今天日期')
      }
    } catch (err) {
      console.error('載入最新交易日期失敗:', err)
      // 發生錯誤時使用今天的日期
      selectedDate.value = getTodayDate()
    }
  }

  // 載入三大法人買賣超數據
  const loadInstitutionalData = async () => {
    loading.value = true
    error.value = null
    try {
      const url = selectedDate.value 
        ? `http://localhost:8000/postgres/institutional-trading/top-industries?date=${selectedDate.value}`
        : 'http://localhost:8000/postgres/institutional-trading/top-industries'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // 合併TSE和TPEX數據
        const combinedData = [
          ...result.data.tse.map(item => ({
            ...item,
            market: 'TSE',
            foreign_net_amount: parseFloat(item.foreign_net_amount) || 0,
            investment_trust_net_amount: parseFloat(item.investment_trust_net_amount) || 0,
            dealer_net_amount: parseFloat(item.dealer_net_amount) || 0,
            total_net_amount: parseFloat(item.total_net_amount) || 0,
            stock_count: parseInt(item.stock_count) || 0,
            rank_in_market: parseInt(item.rank_in_market) || 0
          })),
          ...result.data.tpex.map(item => ({
            ...item,
            market: 'TPEX',
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

  // 載入產業漲跌幅數據
  const loadPerformanceData = async () => {
    loading.value = true
    error.value = null
    try {
      const url = selectedDate.value 
        ? `http://localhost:8000/postgres/industry-analysis?date=${selectedDate.value}`
        : 'http://localhost:8000/postgres/industry-analysis'
      
      const response = await axios.get(url)
      
      if (response.data.success) {
        // 處理數據，確保數值類型正確
        const processedData = response.data.data.map(item => ({
          ...item,
          avg_change_percent: parseFloat(item.avg_change_percent) || 0,
          total_volume: parseFloat(item.total_volume) || 0,
          stock_count: parseInt(item.stock_count) || 0
        }))
        
        performanceData.value = processedData
        console.log('產業漲跌幅數據載入成功:', processedData.length, '筆記錄')
      } else {
        throw new Error(response.data.message || '查詢產業漲跌幅數據失敗')
      }
    } catch (err) {
      error.value = err.message || '載入產業漲跌幅數據失敗'
      console.error('載入產業漲跌幅數據失敗:', err)
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
      
      const url = selectedDate.value 
        ? `http://localhost:8000/postgres/institutional-trading/industry-details/${market}/${encodeURIComponent(industryType)}?date=${selectedDate.value}`
        : `http://localhost:8000/postgres/institutional-trading/industry-details/${market}/${encodeURIComponent(industryType)}`
      
      const response = await fetch(url)
      
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

  // 格式化百分比
  const formatPercent = (value) => {
    if (value === null || value === undefined) return '-'
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return '-'
    return `${numValue > 0 ? '+' : ''}${numValue.toFixed(2)}%`
  }

  // 格式化數字
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return '-'
    
    // 如果是億級別的數字，顯示為億
    if (numValue >= 100000000) {
      return (numValue / 100000000).toFixed(1) + '億'
    }
    // 如果是萬級別的數字，顯示為萬
    else if (numValue >= 10000) {
      return (numValue / 10000).toFixed(1) + '萬'
    }
    // 否則顯示原數字
    else {
      return Math.round(numValue).toLocaleString()
    }
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

  // 獲取漲跌幅樣式類別
  const getChangeClass = (value) => {
    if (value === null || value === undefined) return ''
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ''
    if (numValue > 0) return 'positive'
    if (numValue < 0) return 'negative'
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

  // 設置日期
  const setDate = (date) => {
    selectedDate.value = date
  }

  // 獲取格式化的日期字符串
  const getFormattedDate = computed(() => {
    if (!selectedDate.value) return ''
    const date = new Date(selectedDate.value)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  })

  return {
    // 狀態
    loading,
    error,
    institutionalData,
    performanceData,
    industryDetails,
    selectedIndustry,
    selectedMarket,
    selectedDate,
    maxDate,
    
    // 計算屬性
    getFormattedDate,
    
    // 方法
    loadLatestTradeDate,
    loadInstitutionalData,
    loadPerformanceData,
    loadIndustryDetails,
    clearIndustryDetails,
    setDate,
    
    // 格式化方法
    formatAmount,
    formatPercent,
    formatNumber,
    getAmountClass,
    getChangeClass,
    getMarketName
  }
}
