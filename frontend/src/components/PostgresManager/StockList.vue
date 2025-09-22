<template>
  <div class="section">
    <h3>股票清單</h3>
    <div class="stock-controls">
      <button @click="loadStockList" :disabled="loading" class="btn">
        {{ loading ? '載入中...' : '載入股票清單' }}
      </button>
      <div v-if="stockList.length > 0" class="stock-count">
        <span v-if="searchQuery">
          共 {{ filteredStocks.length }} 支股票
          <span v-if="filteredStocks.length !== stockList.length">
            (從 {{ stockList.length }} 支中篩選)
          </span>
        </span>
        <span v-else>
          共 0 支股票 (總計 {{ stockList.length }} 支)
        </span>
      </div>
    </div>
    
    <div v-if="stockList.length > 0" class="search-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋股票代號或名稱..." 
          class="search-input"
        />
        <div v-if="searchQuery" class="search-clear" @click="clearSearch">
          ✕
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="stockList.length > 0 && searchQuery" class="stock-list">
      <div class="stock-table">
        <div class="stock-header">
          <div class="stock-cell">股票代號</div>
          <div class="stock-cell">股票名稱</div>
          <div class="stock-cell">市場</div>
        </div>
        <div 
          v-for="(stock, index) in filteredStocks" 
          :key="index" 
          class="stock-row"
          :class="{ 'even': index % 2 === 0 }"
          @click="selectStock(stock)"
        >
          <div class="stock-cell stock-id">{{ stock.stock_id }}</div>
          <div class="stock-cell stock-name">{{ stock.stock_name }}</div>
          <div class="stock-cell stock-market">{{ stock.market || '-' }}</div>
        </div>
      </div>
      <div v-if="filteredStocks.length === 0 && searchQuery" class="no-results">
        沒有找到符合「{{ searchQuery }}」的股票
      </div>
    </div>
    
    <div v-if="stockList.length > 0 && !searchQuery" class="no-search-message">
      請輸入搜尋條件以查看股票清單
    </div>
    
    <!-- 股票圖表區域 -->
    <div v-if="selectedStock && chartData.length > 0" class="chart-section">
      <h4>{{ selectedStock.stock_name }} ({{ selectedStock.stock_id }}) - K線圖</h4>
      <div ref="chartContainer" class="chart-container"></div>
    </div>
    
    <div v-if="!loading && stockList.length === 0 && !error" class="no-data">
      尚未載入股票資料
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { usePostgres } from '../../composables/usePostgres'

export default {
  name: 'StockList',
  setup() {
    const { loading, error, executeQuery } = usePostgres()
    const stockList = ref([])
    const searchQuery = ref('')
    const selectedStock = ref(null)
    const chartData = ref([])
    const chartContainer = ref(null)
    let chartInstance = null

    const loadStockList = async () => {
      try {
        const query = 'SELECT DISTINCT stock_id, stock_name, market FROM tw_stock_price ORDER BY stock_id'
        const result = await executeQuery(query, 3000, 0)
        
        if (result.success) {
          stockList.value = result.data
        } else {
          throw new Error(result.message || '查詢失敗')
        }
      } catch (err) {
        console.error('載入股票清單失敗:', err)
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
        (stock.market && stock.market.toLowerCase().includes(query))
      )
    })

    // 清除搜尋
    const clearSearch = () => {
      searchQuery.value = ''
    }

    // 選擇股票
    const selectStock = async (stock) => {
      selectedStock.value = stock
      await loadStockChartData(stock.stock_id)
    }

    // 載入股票K線數據
    const loadStockChartData = async (stockId) => {
      try {
        const query = `SELECT trade_date, open, close, high, low, shares FROM tw_stock_price WHERE stock_id = '${stockId}' ORDER BY trade_date DESC`
        const result = await executeQuery(query, 5000, 0)
        
        if (result.success) {
          chartData.value = result.data
          await nextTick()
          renderChart()
        } else {
          throw new Error(result.message || '查詢K線數據失敗')
        }
      } catch (err) {
        console.error('載入K線數據失敗:', err)
        chartData.value = []
      }
    }

    // 動態加載 ECharts
    const loadECharts = () => {
      return new Promise((resolve, reject) => {
        if (window.echarts) {
          resolve(window.echarts)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'
        script.onload = () => {
          resolve(window.echarts)
        }
        script.onerror = () => {
          reject(new Error('Failed to load ECharts'))
        }
        document.head.appendChild(script)
      })
    }

    // 渲染圖表
    const renderChart = async () => {
      if (!chartContainer.value || chartData.value.length === 0) return

      try {
        // 動態加載 ECharts
        const echarts = await loadECharts()

        // 銷毀現有圖表實例
        if (chartInstance) {
          chartInstance.dispose()
          chartInstance = null
        }

        // 創建新圖表實例
        chartInstance = echarts.init(chartContainer.value)

        // 準備數據
        const dates = chartData.value.map(item => item.trade_date).reverse()
        const values = chartData.value.map(item => [
          item.open,
          item.close,
          item.low,
          item.high
        ]).reverse()

        // 圖表配置
        const option = {
          title: {
            text: `${selectedStock.value.stock_name} (${selectedStock.value.stock_id})`,
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['K線'],
            top: 30
          },
          grid: {
            left: '10%',
            right: '10%',
            bottom: '15%'
          },
          xAxis: {
            type: 'category',
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          },
          yAxis: {
            scale: true,
            splitArea: {
              show: true
            }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 50,
              end: 100
            },
            {
              show: true,
              type: 'slider',
              top: '90%',
              start: 50,
              end: 100
            }
          ],
          series: [
            {
              name: 'K線',
              type: 'candlestick',
              data: values,
              itemStyle: {
                color: '#ec0000',
                color0: '#00da3c',
                borderColor: '#8A0000',
                borderColor0: '#008F28'
              }
            }
          ]
        }

        chartInstance.setOption(option)

        // 響應式調整
        const handleResize = () => {
          if (chartInstance) {
            chartInstance.resize()
          }
        }
        
        // 移除舊的監聽器
        window.removeEventListener('resize', handleResize)
        // 添加新的監聽器
        window.addEventListener('resize', handleResize)

      } catch (error) {
        console.error('載入圖表失敗:', error)
      }
    }

    // 組件掛載時自動載入
    onMounted(() => {
      loadStockList()
    })

    // 組件卸載時清理圖表
    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
    })

    return {
      loading,
      error,
      stockList,
      searchQuery,
      filteredStocks,
      selectedStock,
      chartData,
      chartContainer,
      loadStockList,
      clearSearch,
      selectStock
    }
  }
}
</script>

<style scoped>
.section {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.stock-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--btn-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.btn:hover:not(:disabled) {
  background-color: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  background-color: var(--btn-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.stock-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.search-section {
  margin: 1rem 0;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--btn-primary);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin: 1rem 0;
}

.stock-list {
  margin-top: 1rem;
}

.stock-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-card);
  overflow: hidden;
}

.stock-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.stock-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  border-top: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.stock-row:hover {
  background-color: var(--bg-hover);
}

.stock-row.even {
  background-color: var(--bg-card);
}

.stock-row.even:hover {
  background-color: var(--bg-hover);
}

.stock-cell {
  padding: 0.75rem 1rem;
  border-right: 1px solid var(--border-color);
  font-size: 0.9rem;
  word-break: break-word;
}

.stock-cell:last-child {
  border-right: none;
}

.stock-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.stock-name {
  color: var(--text-primary);
}

.stock-market {
  color: var(--text-primary);
  text-align: center;
  font-weight: 500;
}

.stock-row {
  cursor: pointer;
}

.stock-row:hover {
  background-color: var(--bg-hover);
}

.chart-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.chart-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 500px;
  background-color: var(--bg-primary);
  border-radius: 4px;
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.no-results {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 1.5rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}

.no-search-message {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}

.dark-theme .btn:hover:not(:disabled) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.dark-theme .error-message {
  background-color: #2a1a1a;
  color: #ff6b6b;
  border-color: #4a2a2a;
}

@media (max-width: 768px) {
  .stock-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .stock-header,
  .stock-row {
    grid-template-columns: 1fr;
  }
  
  .stock-cell {
    padding: 0.5rem;
  }
  
  .stock-id {
    font-weight: 700;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }
  
  .stock-market {
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
