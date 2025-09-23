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
    
    <!-- 搜尋組件 -->
    <StockSearch 
      v-if="stockList.length > 0"
      v-model:searchQuery="searchQuery"
      @clear="clearSearch"
    />
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 股票圖表組件 -->
    <StockChart :selectedStock="selectedStock" />

    <!-- 股票表格組件 -->
    <StockTable 
      v-if="stockList.length > 0 && searchQuery"
      :stocks="filteredStocks"
      :searchQuery="searchQuery"
      @select-stock="selectStock"
    />
    
    <div v-if="stockList.length > 0 && !searchQuery" class="no-search-message">
      請輸入搜尋條件以查看股票清單
    </div>
    
    
    
    <div v-if="!loading && stockList.length === 0 && !error" class="no-data">
      尚未載入股票資料
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStockList } from '../../composables/useStockList'
import { useStockChart } from '../../composables/useStockChart'
import StockSearch from './StockSearch.vue'
import StockTable from './StockTable.vue'
import StockChart from './StockChart.vue'

export default {
  name: 'StockList',
  components: {
    StockSearch,
    StockTable,
    StockChart
  },
  setup() {
    const {
      loading,
      error,
      stockList,
      searchQuery,
      filteredStocks,
      loadStockList,
      clearSearch
    } = useStockList()

    const selectedStock = ref(null)

    // 處理股票選擇
    const handleSelectStock = (stock) => {
      selectedStock.value = stock
    }

    // 組件掛載時自動載入
    onMounted(() => {
      loadStockList()
    })

    return {
      loading,
      error,
      stockList,
      searchQuery,
      filteredStocks,
      selectedStock,
      loadStockList,
      clearSearch,
      selectStock: handleSelectStock
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

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fcc;
  margin: 1rem 0;
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
}
</style>
