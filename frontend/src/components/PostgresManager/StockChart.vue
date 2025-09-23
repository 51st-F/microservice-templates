<template>
  <div v-if="selectedStock && chartData.length > 0" class="chart-section">
    <h4>{{ selectedStock.stock_name }} ({{ selectedStock.stock_id }}) - K線圖</h4>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStockChart } from '../../composables/useStockChart'
import { useTheme } from '../../composables/useTheme'

export default {
  name: 'StockChart',
  props: {
    selectedStock: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const {
      chartData,
      chartContainer,
      selectedStock,
      loadStockChartData,
      renderChart,
      rerenderChart,
      disposeChart
    } = useStockChart()

    const { subscribe } = useTheme()

    // 監聽選中的股票變化
    watch(() => props.selectedStock, async (newStock) => {
      console.log('StockChart: selectedStock changed:', newStock)
      if (newStock) {
        selectedStock.value = newStock
        try {
          console.log('StockChart: loading chart data for:', newStock.stock_id)
          await loadStockChartData(newStock.stock_id)
          console.log('StockChart: chart data loaded:', chartData.value.length, 'records')
        } catch (error) {
          console.error('載入圖表數據失敗:', error)
        }
      } else {
        selectedStock.value = null
        chartData.value = []
      }
    }, { immediate: true })

    // 監聽主題變化並重新渲染圖表
    let unsubscribe
    onMounted(() => {
      unsubscribe = subscribe((isDark) => {
        console.log('StockChart: theme changed to', isDark ? 'dark' : 'light')
        // 延遲重新渲染，確保 DOM 更新完成
        nextTick(() => {
          rerenderChart()
        })
      })
    })

    // 組件卸載時清理圖表和監聽器
    onUnmounted(() => {
      disposeChart()
      if (unsubscribe) {
        unsubscribe()
      }
    })

    return {
      chartData,
      chartContainer,
      selectedStock,
      renderChart,
      disposeChart
    }
  }
}
</script>

<style scoped>
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
  height: 600px;
  background-color: var(--bg-primary);
  border-radius: 4px;
}
</style>
