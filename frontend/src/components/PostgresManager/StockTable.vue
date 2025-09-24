<template>
  <div class="stock-list">
    <div class="stock-table">
      <div class="stock-header">
        <div class="stock-cell">股票代號</div>
        <div class="stock-cell">股票名稱</div>
        <div class="stock-cell">市場</div>
        <div class="stock-cell">產業類型</div>
      </div>
      <div 
        v-for="(stock, index) in stocks" 
        :key="index" 
        class="stock-row"
        :class="{ 'even': index % 2 === 0 }"
        @click="$emit('select-stock', stock)"
      >
        <div class="stock-cell stock-id">{{ stock.stock_id }}</div>
        <div class="stock-cell stock-name">{{ stock.stock_name }}</div>
        <div class="stock-cell stock-market">{{ stock.market || '-' }}</div>
        <div class="stock-cell stock-industry">{{ stock.industry_type || '-' }}</div>
      </div>
    </div>
    <div v-if="stocks.length === 0 && searchQuery" class="no-results">
      沒有找到符合「{{ searchQuery }}」的股票
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockTable',
  props: {
    stocks: {
      type: Array,
      required: true,
      default: () => []
    },
    searchQuery: {
      type: String,
      required: true
    }
  },
  emits: ['select-stock']
}
</script>

<style scoped>
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
  grid-template-columns: 1fr 2fr 1fr 1.5fr;
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.stock-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1.5fr;
  border-top: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  cursor: pointer;
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

.stock-industry {
  color: var(--text-primary);
  text-align: center;
  font-weight: 500;
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

@media (max-width: 768px) {
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
  
  .stock-industry {
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
