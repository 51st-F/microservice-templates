<template>
  <div class="section">
    <h3>產業綜合分析</h3>
    
    <!-- 控制面板 -->
    <div class="controls-panel">
      <!-- 日期選擇 -->
      <div class="date-selector">
        <label for="analysis-date">分析日期：</label>
        <input 
          id="analysis-date"
          type="date" 
          v-model="selectedDate" 
          :max="maxDate"
          class="date-input"
        />
      </div>
      
      <!-- 數據類型選擇 -->
      <div class="data-type-selector">
        <label>
          <input 
            type="checkbox" 
            v-model="showInstitutional" 
            @change="loadAllData"
          />
          顯示三大法人買賣超
        </label>
        <label>
          <input 
            type="checkbox" 
            v-model="showPerformance" 
            @change="loadAllData"
          />
          顯示漲跌幅與交易量
        </label>
      </div>
      
      <!-- 載入按鈕 -->
      <button @click="loadData" :disabled="loading" class="btn">
        {{ loading ? '載入中...' : '載入數據' }}
      </button>
      
      <!-- 數據統計 -->
      <div v-if="mergedData.length > 0" class="data-count">
        共 {{ mergedData.length }} 個產業類別
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Tabs 導航 -->
    <div v-if="mergedData.length > 0" class="tabs-container">
      <div class="tabs-header">
        <button 
          @click="activeTab = 'TSE'"
          :class="['tab-btn', { active: activeTab === 'TSE' }]"
        >
          上市 ({{ tseData.length }})
        </button>
        <button 
          @click="activeTab = 'TPEX'"
          :class="['tab-btn', { active: activeTab === 'TPEX' }]"
        >
          上櫃 ({{ tpexData.length }})
        </button>
      </div>
      
      <!-- Tab 內容 -->
      <div class="tab-content">
        <!-- 上市 Tab -->
        <div v-if="activeTab === 'TSE'" class="tab-panel">
          <div class="table-header">
            <h4>上市產業綜合分析</h4>
          </div>
          
          <div class="data-table">
            <div class="table-header-row" :style="getGridTemplate()">
              <div 
                v-for="column in getColumns()" 
                :key="column.key"
                class="table-cell sortable" 
                @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <span class="sort-icon" v-if="sortBy === column.key">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div v-if="showInstitutional" class="table-cell">操作</div>
            </div>
            
            <div 
              v-for="(industry, index) in sortedTseData" 
              :key="`tse-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
              :style="getGridTemplate()"
            >
              <!-- 產業名稱 -->
              <div class="table-cell industry-name">{{ industry.industry_type || '未分類' }}</div>
              
              <!-- 股票數量 -->
              <div class="table-cell stock-count">{{ industry.stock_count || industry.performance_stock_count || '-' }}</div>
              
              <!-- 三大法人買賣超數據 -->
              <template v-if="showInstitutional">
                <div class="table-cell amount" :class="getAmountClass(industry.foreign_net_amount)">
                  {{ formatAmount(industry.foreign_net_amount) }}
                </div>
                <div class="table-cell amount" :class="getAmountClass(industry.investment_trust_net_amount)">
                  {{ formatAmount(industry.investment_trust_net_amount) }}
                </div>
                <div class="table-cell amount" :class="getAmountClass(industry.dealer_net_amount)">
                  {{ formatAmount(industry.dealer_net_amount) }}
                </div>
                <div class="table-cell amount total" :class="getAmountClass(industry.total_net_amount)">
                  {{ formatAmount(industry.total_net_amount) }}
                </div>
              </template>
              
              <!-- 漲跌幅與交易量數據 -->
              <template v-if="showPerformance">
                <div class="table-cell change-percent" :class="getChangeClass(industry.avg_change_percent)">
                  {{ formatPercent(industry.avg_change_percent) }}
                </div>
                <div class="table-cell total-volume">{{ formatNumber(industry.total_volume) }}</div>
              </template>
              
              <!-- 操作按鈕 -->
              <div v-if="showInstitutional" class="table-cell action">
                <button 
                  v-if="industry.foreign_net_amount !== undefined"
                  @click="showIndustryDetails('TSE', industry.industry_type)"
                  class="detail-btn"
                >
                  查看詳情
                </button>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 上櫃 Tab -->
        <div v-if="activeTab === 'TPEX'" class="tab-panel">
          <div class="table-header">
            <h4>上櫃產業綜合分析</h4>
          </div>
          
          <div class="data-table">
            <div class="table-header-row" :style="getGridTemplate()">
              <div 
                v-for="column in getColumns()" 
                :key="column.key"
                class="table-cell sortable" 
                @click="toggleSort(column.key)"
              >
                {{ column.label }}
                <span class="sort-icon" v-if="sortBy === column.key">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div v-if="showInstitutional" class="table-cell">操作</div>
            </div>
            
            <div 
              v-for="(industry, index) in sortedTpexData" 
              :key="`tpex-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
              :style="getGridTemplate()"
            >
              <!-- 產業名稱 -->
              <div class="table-cell industry-name">{{ industry.industry_type || '未分類' }}</div>
              
              <!-- 股票數量 -->
              <div class="table-cell stock-count">{{ industry.stock_count || industry.performance_stock_count || '-' }}</div>
              
              <!-- 三大法人買賣超數據 -->
              <template v-if="showInstitutional">
                <div class="table-cell amount" :class="getAmountClass(industry.foreign_net_amount)">
                  {{ formatAmount(industry.foreign_net_amount) }}
                </div>
                <div class="table-cell amount" :class="getAmountClass(industry.investment_trust_net_amount)">
                  {{ formatAmount(industry.investment_trust_net_amount) }}
                </div>
                <div class="table-cell amount" :class="getAmountClass(industry.dealer_net_amount)">
                  {{ formatAmount(industry.dealer_net_amount) }}
                </div>
                <div class="table-cell amount total" :class="getAmountClass(industry.total_net_amount)">
                  {{ formatAmount(industry.total_net_amount) }}
                </div>
              </template>
              
              <!-- 漲跌幅與交易量數據 -->
              <template v-if="showPerformance">
                <div class="table-cell change-percent" :class="getChangeClass(industry.avg_change_percent)">
                  {{ formatPercent(industry.avg_change_percent) }}
                </div>
                <div class="table-cell total-volume">{{ formatNumber(industry.total_volume) }}</div>
              </template>
              
              <!-- 操作按鈕 -->
              <div v-if="showInstitutional" class="table-cell action">
                <button 
                  v-if="industry.foreign_net_amount !== undefined"
                  @click="showIndustryDetails('TPEX', industry.industry_type)"
                  class="detail-btn"
                >
                  查看詳情
                </button>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 產業詳細內容彈窗 (僅三大法人視圖) -->
    <div v-if="industryDetails.length > 0 && showInstitutional" class="details-modal">
      <div class="modal-overlay" @click="closeIndustryDetails"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h4>{{ getMarketName(selectedMarket) }} - {{ selectedIndustry }} 產業詳細買賣超</h4>
          <button @click="closeIndustryDetails" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="details-table">
            <div class="table-header-row">
              <div class="table-cell">股票代號</div>
              <div class="table-cell">股票名稱</div>
              <div class="table-cell">外資買賣超</div>
              <div class="table-cell">投信買賣超</div>
              <div class="table-cell">自營商買賣超</div>
              <div class="table-cell">合計買賣超</div>
            </div>
            
            <div 
              v-for="(stock, index) in industryDetails" 
              :key="`detail-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
            >
              <div class="table-cell stock-id">{{ stock.stock_id }}</div>
              <div class="table-cell stock-name">{{ stock.stock_name }}</div>
              <div class="table-cell amount" :class="getAmountClass(stock.foreign_net_amount)">
                {{ formatAmount(stock.foreign_net_amount) }}
              </div>
              <div class="table-cell amount" :class="getAmountClass(stock.investment_trust_net_amount)">
                {{ formatAmount(stock.investment_trust_net_amount) }}
              </div>
              <div class="table-cell amount" :class="getAmountClass(stock.dealer_net_amount)">
                {{ formatAmount(stock.dealer_net_amount) }}
              </div>
              <div class="table-cell amount total" :class="getAmountClass(stock.total_net_amount)">
                {{ formatAmount(stock.total_net_amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && mergedData.length === 0 && !error" class="no-data">
      尚未載入產業分析資料
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useIndustryComprehensive } from '../../composables/useIndustryComprehensive'

export default {
  name: 'IndustryComprehensive',
  setup() {
    const {
      loading,
      error,
      institutionalData,
      performanceData,
      industryDetails,
      selectedIndustry,
      selectedMarket,
      selectedDate,
      maxDate,
      loadLatestTradeDate,
      loadInstitutionalData,
      loadPerformanceData,
      loadIndustryDetails,
      clearIndustryDetails,
      formatAmount,
      formatPercent,
      formatNumber,
      getAmountClass,
      getChangeClass,
      getMarketName
    } = useIndustryComprehensive()

    const showInstitutional = ref(true)
    const showPerformance = ref(true)
    const sortBy = ref('industry_type')
    const sortOrder = ref('asc')
    const activeTab = ref('TSE')

    // 標準化市場名稱
    const normalizeMarket = (market) => {
      if (market === 'OTC' || market === 'TPEX') {
        return 'TPEX'
      }
      return market
    }

    // 合併數據
    const mergedData = computed(() => {
      const merged = new Map()
      
      // 添加三大法人數據
      if (showInstitutional.value) {
        institutionalData.value.forEach(item => {
          const normalizedMarket = normalizeMarket(item.market)
          const key = `${normalizedMarket}-${item.industry_type}`
          merged.set(key, { 
            ...item, 
            market: normalizedMarket 
          })
        })
      }
      
      // 添加漲跌幅數據
      if (showPerformance.value) {
        performanceData.value.forEach(item => {
          const normalizedMarket = normalizeMarket(item.market)
          const key = `${normalizedMarket}-${item.industry_type}`
          if (merged.has(key)) {
            // 合併數據
            const existing = merged.get(key)
            merged.set(key, {
              ...existing,
              avg_change_percent: item.avg_change_percent,
              total_volume: item.total_volume,
              performance_stock_count: item.stock_count
            })
          } else {
            // 新增數據
            merged.set(key, {
              ...item,
              market: normalizedMarket,
              performance_stock_count: item.stock_count
            })
          }
        })
      }
      
      const result = Array.from(merged.values())
      console.log('合併後的數據:', result)
      console.log('上市數據數量:', result.filter(item => item.market === 'TSE').length)
      console.log('上櫃數據數量:', result.filter(item => item.market === 'TPEX').length)
      return result
    })

    // 上市數據
    const tseData = computed(() => {
      if (!mergedData.value.length) return []
      return mergedData.value.filter(item => item.market === 'TSE')
    })

    // 上櫃數據
    const tpexData = computed(() => {
      if (!mergedData.value.length) return []
      return mergedData.value.filter(item => item.market === 'TPEX')
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
    const sortedTpexData = computed(() => {
      return sortData(tpexData.value)
    })

    // 獲取表格欄位
    const getColumns = () => {
      const columns = [
        { key: 'industry_type', label: '產業類別' },
        { key: 'stock_count', label: '股票數量' }
      ]
      
      if (showInstitutional.value) {
        columns.push(
          { key: 'foreign_net_amount', label: '外資買賣超' },
          { key: 'investment_trust_net_amount', label: '投信買賣超' },
          { key: 'dealer_net_amount', label: '自營商買賣超' },
          { key: 'total_net_amount', label: '合計買賣超' }
        )
      }
      
      if (showPerformance.value) {
        columns.push(
          { key: 'avg_change_percent', label: '平均漲跌幅' },
          { key: 'total_volume', label: '總交易量' }
        )
      }
      
      return columns
    }

    // 獲取表格網格模板
    const getGridTemplate = () => {
      let columns = ['1.5fr', '0.8fr'] // 產業類別, 股票數量
      
      if (showInstitutional.value) {
        columns.push('1fr', '1fr', '1fr', '1.2fr') // 外資, 投信, 自營商, 合計
      }
      
      if (showPerformance.value) {
        columns.push('1fr', '1.2fr') // 漲跌幅, 交易量
      }
      
      if (showInstitutional.value) {
        columns.push('1fr') // 操作按鈕
      }
      
      return { gridTemplateColumns: columns.join(' ') }
    }

    // 切換排序
    const toggleSort = (field) => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'desc'
      }
    }

    // 載入所有數據
    const loadAllData = async () => {
      try {
        const promises = []
        if (showInstitutional.value) {
          promises.push(loadInstitutionalData())
        }
        if (showPerformance.value) {
          promises.push(loadPerformanceData())
        }
        await Promise.all(promises)
      } catch (err) {
        console.error('載入數據失敗:', err)
      }
    }

    // 載入數據
    const loadData = loadAllData

    // 顯示產業詳細內容
    const showIndustryDetails = async (market, industryType) => {
      try {
        await loadIndustryDetails(market, industryType)
      } catch (err) {
        console.error('載入產業詳細內容失敗:', err)
      }
    }

    // 關閉產業詳細內容
    const closeIndustryDetails = () => {
      clearIndustryDetails()
    }

    // 監聽日期變化，自動重新載入數據
    watch(selectedDate, () => {
      if (mergedData.value.length > 0) {
        loadData()
      }
    })

    // 組件掛載時先載入最新交易日期，然後載入數據
    onMounted(async () => {
      await loadLatestTradeDate()
      loadData()
    })

    return {
      loading,
      error,
      mergedData,
      industryDetails,
      selectedIndustry,
      selectedMarket,
      selectedDate,
      maxDate,
      showInstitutional,
      showPerformance,
      tseData,
      tpexData,
      sortedTseData,
      sortedTpexData,
      sortBy,
      sortOrder,
      activeTab,
      loadData,
      loadAllData,
      formatAmount,
      formatPercent,
      formatNumber,
      getAmountClass,
      getChangeClass,
      getMarketName,
      getColumns,
      getGridTemplate,
      toggleSort,
      showIndustryDetails,
      closeIndustryDetails
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

.controls-panel {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-selector label {
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.data-type-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.data-type-selector label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.data-type-selector input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--btn-primary);
  cursor: pointer;
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
  white-space: nowrap;
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

.detail-btn {
  padding: 0.5rem 1rem;
  background-color: var(--btn-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  background-color: var(--btn-primary);
  color: white;
  border-color: var(--btn-primary);
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

.data-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  overflow: hidden;
  overflow-x: auto;
}

.table-header-row {
  display: grid;
  background-color: var(--bg-primary);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  min-width: 800px;
}

.table-row {
  display: grid;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  min-width: 800px;
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
  padding: 0.8rem;
  border-right: 1px solid var(--border-color);
  font-size: 0.85rem;
  word-break: break-word;
  display: flex;
  align-items: center;
}

.table-cell:last-child {
  border-right: none;
}

.rank {
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  justify-content: center;
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

.amount {
  text-align: right;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  justify-content: flex-end;
}

.amount.positive {
  color: #dc3545;
}

.amount.negative {
  color: #28a745;
}

.amount.neutral {
  color: var(--text-secondary);
}

.amount.total {
  font-weight: 700;
  font-size: 0.9rem;
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

.action {
  justify-content: center;
}

.stock-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--text-primary);
}

.stock-name {
  font-weight: 500;
  color: var(--text-primary);
}

/* 詳細內容彈窗 */
.details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.modal-content {
  position: relative;
  background-color: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  width: 1200px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  border-radius: 12px 12px 0 0;
}

.modal-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  overflow: auto;
  flex: 1;
}

.details-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  overflow: hidden;
  overflow-x: auto;
}

.details-table .table-header-row {
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1.2fr;
  min-width: 700px;
}

.details-table .table-row {
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1.2fr;
  min-width: 700px;
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
  .controls-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .view-selector {
    width: 100%;
  }
  
  .view-btn {
    flex: 1;
    text-align: center;
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
  
  .modal-content {
    width: 95vw;
    height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>
