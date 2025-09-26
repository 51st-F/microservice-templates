<template>
  <div class="section">
    <h3>三大法人買賣超分析</h3>
    <div class="institutional-controls">
      <button @click="loadTopIndustries" :disabled="loading" class="btn">
        {{ loading ? '載入中...' : '載入買賣超數據' }}
      </button>
      <div v-if="institutionalData.length > 0" class="data-count">
        共 {{ institutionalData.length }} 個產業類別
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Tabs 導航 -->
    <div v-if="institutionalData.length > 0" class="tabs-container">
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
            <h4>上市三大法人買賣超產業</h4>
          </div>
          
          <div class="institutional-table">
            <div class="table-header-row">
              <div class="table-cell sortable" @click="toggleSort('rank_in_market')">
                排名
                <span class="sort-icon" v-if="sortBy === 'rank_in_market'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
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
              <div class="table-cell sortable" @click="toggleSort('foreign_net_amount')">
                外資買賣超
                <span class="sort-icon" v-if="sortBy === 'foreign_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('investment_trust_net_amount')">
                投信買賣超
                <span class="sort-icon" v-if="sortBy === 'investment_trust_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('dealer_net_amount')">
                自營商買賣超
                <span class="sort-icon" v-if="sortBy === 'dealer_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('total_net_amount')">
                合計買賣超
                <span class="sort-icon" v-if="sortBy === 'total_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell">操作</div>
            </div>
            
            <div 
              v-for="(industry, index) in sortedTseData" 
              :key="`tse-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
            >
              <div class="table-cell rank">
                {{ industry.rank_in_market }}
              </div>
              <div class="table-cell industry-name">
                {{ industry.industry_type || '未分類' }}
              </div>
              <div class="table-cell stock-count">
                {{ industry.stock_count }}
              </div>
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
              <div class="table-cell action">
                <button 
                  @click="showIndustryDetails('TSE', industry.industry_type)"
                  class="detail-btn"
                >
                  查看詳情
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 上櫃 Tab -->
        <div v-if="activeTab === 'TPEX'" class="tab-panel">
          <div class="table-header">
            <h4>上櫃三大法人買賣超產業</h4>
          </div>
          
          <div class="institutional-table">
            <div class="table-header-row">
              <div class="table-cell sortable" @click="toggleSort('rank_in_market')">
                排名
                <span class="sort-icon" v-if="sortBy === 'rank_in_market'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
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
              <div class="table-cell sortable" @click="toggleSort('foreign_net_amount')">
                外資買賣超
                <span class="sort-icon" v-if="sortBy === 'foreign_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('investment_trust_net_amount')">
                投信買賣超
                <span class="sort-icon" v-if="sortBy === 'investment_trust_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('dealer_net_amount')">
                自營商買賣超
                <span class="sort-icon" v-if="sortBy === 'dealer_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell sortable" @click="toggleSort('total_net_amount')">
                合計買賣超
                <span class="sort-icon" v-if="sortBy === 'total_net_amount'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
              <div class="table-cell">操作</div>
            </div>
            
            <div 
              v-for="(industry, index) in sortedTpexData" 
              :key="`tpex-${index}`" 
              class="table-row"
              :class="{ 'even': index % 2 === 0 }"
            >
              <div class="table-cell rank">
                {{ industry.rank_in_market }}
              </div>
              <div class="table-cell industry-name">
                {{ industry.industry_type || '未分類' }}
              </div>
              <div class="table-cell stock-count">
                {{ industry.stock_count }}
              </div>
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
              <div class="table-cell action">
                <button 
                  @click="showIndustryDetails('TPEX', industry.industry_type)"
                  class="detail-btn"
                >
                  查看詳情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 產業詳細內容彈窗 -->
    <div v-if="industryDetails.length > 0" class="details-modal">
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
              <div class="table-cell stock-id">
                {{ stock.stock_id }}
              </div>
              <div class="table-cell stock-name">
                {{ stock.stock_name }}
              </div>
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
    
    <div v-if="!loading && institutionalData.length === 0 && !error" class="no-data">
      尚未載入三大法人買賣超資料
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useInstitutionalTrading } from '../../composables/useInstitutionalTrading'

export default {
  name: 'InstitutionalTrading',
  setup() {
    const {
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
    } = useInstitutionalTrading()

    const sortBy = ref('total_net_amount')
    const sortOrder = ref('desc')
    const activeTab = ref('TSE')

    // 上市數據
    const tseData = computed(() => {
      if (!institutionalData.value.length) return []
      return institutionalData.value.filter(item => item.market === 'TSE')
    })

    // 上櫃數據
    const tpexData = computed(() => {
      if (!institutionalData.value.length) return []
      return institutionalData.value.filter(item => item.market === 'TPEX')
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

    // 組件掛載時自動載入
    onMounted(() => {
      loadTopIndustries()
    })

    return {
      loading,
      error,
      institutionalData,
      industryDetails,
      selectedIndustry,
      selectedMarket,
      tseData,
      tpexData,
      sortedTseData,
      sortedTpexData,
      sortBy,
      sortOrder,
      activeTab,
      loadTopIndustries,
      formatAmount,
      getAmountClass,
      getMarketName,
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

.institutional-controls {
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

.institutional-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  overflow: hidden;
  overflow-x: auto;
}

.table-header-row {
  display: grid;
  grid-template-columns: 0.5fr 1.5fr 0.8fr 1fr 1fr 1fr 1.2fr 1fr;
  background-color: var(--bg-primary);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  min-width: 800px;
}

.table-row {
  display: grid;
  grid-template-columns: 0.5fr 1.5fr 0.8fr 1fr 1fr 1fr 1.2fr 1fr;
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
  .institutional-controls {
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
  .amount,
  .action {
    justify-content: flex-start;
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
