<template>
  <div class="section">
    <h3>產業分析</h3>
    <div class="industry-controls">
      <button @click="loadIndustryData" :disabled="loading" class="btn">
        {{ loading ? '載入中...' : '載入產業分析' }}
      </button>
      <div v-if="industryData.length > 0" class="data-count">
        共 {{ industryData.length }} 個產業類別
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Tabs 導航 -->
    <div v-if="industryData.length > 0" class="tabs-container">
      <div class="tabs-header">
        <button 
          @click="activeTab = 'TSE'"
          :class="['tab-btn', { active: activeTab === 'TSE' }]"
        >
          上市 ({{ tseData.length }})
        </button>
        <button 
          @click="activeTab = 'OTC'"
          :class="['tab-btn', { active: activeTab === 'OTC' }]"
        >
          上櫃 ({{ otcData.length }})
        </button>
      </div>
      
      <!-- Tab 內容 -->
      <div class="tab-content">
        <!-- 上市 Tab -->
        <div v-if="activeTab === 'TSE'" class="tab-panel">
          <div class="table-header">
            <h4>上市產業漲跌幅與交易量統計</h4>
          </div>
          
          <div class="industry-table">
            <div class="table-header-row">
              <div class="table-cell sortable" @click="toggleSort('industry_type')">
                產業類別
                <span class="sort-icon" v-if="sortBy === 'industry_type'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('stock_count')">
                股票數量
                <span class="sort-icon" v-if="sortBy === 'stock_count'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('avg_change_percent')">
                平均漲跌幅
                <span class="sort-icon" v-if="sortBy === 'avg_change_percent'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('total_volume')">
                總交易量
                <span class="sort-icon" v-if="sortBy === 'total_volume'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </div>
            
            <div 
              v-for="(industry, index) in sortedTseData" 
              :key="`tse-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
            >
              <div class="table-cell industry-name">
                {{ industry.industry_type || '未分類' }}
              </div>
              <div class="table-cell stock-count">
                {{ industry.stock_count }}
              </div>
              <div class="table-cell change-percent" :class="getChangeClass(industry.avg_change_percent)">
                {{ formatPercent(industry.avg_change_percent) }}
              </div>
              <div class="table-cell total-volume">
                {{ formatNumber(industry.total_volume) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 上櫃 Tab -->
        <div v-if="activeTab === 'OTC'" class="tab-panel">
          <div class="table-header">
            <h4>上櫃產業漲跌幅與交易量統計</h4>
          </div>
          
          <div class="industry-table">
            <div class="table-header-row">
              <div class="table-cell sortable" @click="toggleSort('industry_type')">
                產業類別
                <span class="sort-icon" v-if="sortBy === 'industry_type'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('stock_count')">
                股票數量
                <span class="sort-icon" v-if="sortBy === 'stock_count'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('avg_change_percent')">
                平均漲跌幅
                <span class="sort-icon" v-if="sortBy === 'avg_change_percent'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('total_volume')">
                總交易量
                <span class="sort-icon" v-if="sortBy === 'total_volume'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </div>
            
            <div 
              v-for="(industry, index) in sortedOtcData" 
              :key="`otc-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
            >
              <div class="table-cell industry-name">
                {{ industry.industry_type || '未分類' }}
              </div>
              <div class="table-cell stock-count">
                {{ industry.stock_count }}
              </div>
              <div class="table-cell change-percent" :class="getChangeClass(industry.avg_change_percent)">
                {{ formatPercent(industry.avg_change_percent) }}
              </div>
              <div class="table-cell total-volume">
                {{ formatNumber(industry.total_volume) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && industryData.length === 0 && !error" class="no-data">
      尚未載入產業分析資料
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useIndustryAnalysis } from '../../composables/useIndustryAnalysis'

export default {
  name: 'IndustryAnalysis',
  setup() {
    const {
      loading,
      error,
      industryData,
      loadIndustryData,
      chartContainer,
      renderChart,
      disposeChart
    } = useIndustryAnalysis()

    const sortBy = ref('avg_change_percent')
    const sortOrder = ref('desc')
    const activeTab = ref('TSE')

    // 上市數據
    const tseData = computed(() => {
      if (!industryData.value.length) return []
      return industryData.value.filter(item => item.market === 'TSE')
    })

    // 上櫃數據
    const otcData = computed(() => {
      if (!industryData.value.length) return []
      return industryData.value.filter(item => item.market === 'OTC')
    })

    // 排序函數
    const sortData = (data) => {
      if (!data.length) return []
      
      return [...data].sort((a, b) => {
        let aVal = a[sortBy.value]
        let bVal = b[sortBy.value]
        
        // 處理 null 值
        if (aVal === null || aVal === undefined) aVal = 0
        if (bVal === null || bVal === undefined) bVal = 0
        
        // 處理字串排序
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder.value === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }
        
        if (sortOrder.value === 'asc') {
          return aVal - bVal
        } else {
          return bVal - aVal
        }
      })
    }

    // 排序後的上市數據
    const sortedTseData = computed(() => {
      return sortData(tseData.value)
    })

    // 排序後的上櫃數據
    const sortedOtcData = computed(() => {
      return sortData(otcData.value)
    })

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
      return Math.round(numValue).toLocaleString()
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

    // 切換排序
    const toggleSort = (field) => {
      if (sortBy.value === field) {
        // 如果點擊同一個欄位，切換升降序
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        // 如果點擊不同欄位，設為該欄位並預設降序
        sortBy.value = field
        sortOrder.value = 'desc'
      }
    }

    // 組件掛載時自動載入
    onMounted(() => {
      loadIndustryData()
    })

    // 組件卸載時清理圖表
    onUnmounted(() => {
      disposeChart()
    })

    return {
      loading,
      error,
      industryData,
      tseData,
      otcData,
      sortedTseData,
      sortedOtcData,
      sortBy,
      sortOrder,
      activeTab,
      loadIndustryData,
      formatPercent,
      formatNumber,
      getChangeClass,
      toggleSort
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

.industry-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tabs-container {
  margin-top: 1rem;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-bottom: 3px solid transparent;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.tab-btn.active {
  color: var(--btn-primary);
  border-bottom-color: var(--btn-primary);
  background-color: var(--bg-card);
}

.tab-content {
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.tab-panel {
  padding: 1.5rem;
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

.btn:disabled {
  background-color: var(--btn-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.data-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin: 1rem 0;
}

.table-header {
  margin-bottom: 1rem;
}

.table-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.industry-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  overflow: hidden;
}

.table-header-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  background-color: var(--bg-primary);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background-color: var(--bg-hover);
}

.sort-icon {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: var(--btn-primary);
  font-weight: bold;
}

.table-row:hover {
  background-color: var(--bg-hover);
}

.table-row.even {
  background-color: var(--bg-card);
}

.table-row.even:hover {
  background-color: var(--bg-hover);
}

.table-cell {
  padding: 1rem;
  border-right: 1px solid var(--border-color);
  font-size: 0.9rem;
  word-break: break-word;
  display: flex;
  align-items: center;
}

.table-cell:last-child {
  border-right: none;
}

.industry-name {
  font-weight: 600;
  color: var(--text-primary);
}

.stock-count {
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
  justify-content: center;
}

.change-percent {
  text-align: center;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  justify-content: center;
}

.change-percent.positive {
  color: #dc3545;
}

.change-percent.negative {
  color: #28a745;
}

.change-percent.neutral {
  color: var(--text-secondary);
}

.total-volume {
  text-align: right;
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
  justify-content: flex-end;
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

.dark-theme .btn:hover:not(:disabled) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.dark-theme .error-message {
  background-color: #2a1a1a;
  color: #ff6b6b;
  border-color: #4a2a2a;
}

@media (max-width: 768px) {
  .industry-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tabs-header {
    flex-direction: column;
  }
  
  .tab-btn {
    border-bottom: none;
    border-right: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-bottom-color: transparent;
    border-right-color: var(--btn-primary);
  }
  
  .tab-panel {
    padding: 1rem;
  }
  
  .table-header {
    margin-bottom: 0.5rem;
  }
  
  .table-header-row,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-cell {
    padding: 0.75rem;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    justify-content: flex-start;
  }
  
  .table-cell:last-child {
    border-bottom: none;
  }
  
  .sortable {
    cursor: pointer;
  }
  
  .industry-name {
    font-weight: 700;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    justify-content: flex-start;
  }
  
  .stock-count,
  .change-percent,
  .total-volume {
    justify-content: flex-start;
  }
}
</style>
