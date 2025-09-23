import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { usePostgres } from './usePostgres'
import { useTheme } from './useTheme'

export function useStockChart() {
  const { loading, error, executeQuery } = usePostgres()
  const chartData = ref([])
  const selectedStock = ref(null)
  const chartContainer = ref(null)
  let chartInstance = null

  // 移動平均線控制
  const showMA5 = ref(true)
  const showMA10 = ref(true)
  const showMA20 = ref(true)
  const showMA30 = ref(true)

  // 載入股票K線數據
  const loadStockChartData = async (stockId) => {
    try {
      console.log('useStockChart: loading data for stock:', stockId)
      const query = `SELECT trade_date, open, close, high, low, shares FROM tw_stock_price WHERE stock_id = '${stockId}' ORDER BY trade_date DESC`
      const result = await executeQuery(query, 5000, 0)
      
      if (result.success) {
        console.log('useStockChart: query successful, got', result.data.length, 'records')
        chartData.value = result.data
        await nextTick()
        console.log('useStockChart: calling renderChart')
        renderChart()
      } else {
        throw new Error(result.message || '查詢K線數據失敗')
      }
    } catch (err) {
      console.error('載入K線數據失敗:', err)
      chartData.value = []
      throw err
    }
  }

  // 計算移動平均線
  const calculateMovingAverage = (data, period) => {
    const ma = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push(null)
      } else {
        const slice = data.slice(i - period + 1, i + 1)
        const sum = slice.reduce((acc, val) => acc + (val || 0), 0)
        const average = sum / period
        ma.push(Math.round(average * 100) / 100) // 四捨五入到小數點第二位
      }
    }
    return ma
  }

  // 計算布林帶 (Bollinger Bands)
  const calculateBollingerBands = (data, period = 20, stdDev = 2.0) => {
    const upperBand = []
    const middleBand = []
    const lowerBand = []
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upperBand.push(null)
        middleBand.push(null)
        lowerBand.push(null)
      } else {
        const slice = data.slice(i - period + 1, i + 1)
        
        // 計算移動平均（中軌）
        const sum = slice.reduce((acc, val) => acc + (val || 0), 0)
        const mean = sum / period
        
        // 計算標準差
        const variance = slice.reduce((acc, val) => acc + Math.pow((val || 0) - mean, 2), 0) / period
        const standardDeviation = Math.sqrt(variance)
        
        // 計算上下軌
        const upper = mean + (stdDev * standardDeviation)
        const lower = mean - (stdDev * standardDeviation)
        
        upperBand.push(Math.round(upper * 100) / 100)
        middleBand.push(Math.round(mean * 100) / 100)
        lowerBand.push(Math.round(lower * 100) / 100)
      }
    }
    
    return { upperBand, middleBand, lowerBand }
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

  // 獲取主題相關的顏色
  const getThemeColors = () => {
    const isDark = document.documentElement.classList.contains('dark-theme')
    return {
      textColor: isDark ? '#ffffff' : '#212529',
      axisLineColor: isDark ? '#404040' : '#dee2e6',
      splitLineColor: isDark ? '#404040' : '#dee2e6',
      backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
      gridColor: isDark ? '#404040' : '#dee2e6',
      tooltipBackgroundColor: isDark ? '#2d2d2d' : '#ffffff',
      tooltipBorderColor: isDark ? '#404040' : '#dee2e6'
    }
  }

  // 渲染圖表
  const renderChart = async () => {
    console.log('useStockChart: renderChart called')
    console.log('useStockChart: chartContainer.value:', chartContainer.value)
    console.log('useStockChart: chartData.value.length:', chartData.value.length)
    
    if (!chartContainer.value || chartData.value.length === 0) {
      console.log('useStockChart: renderChart aborted - no container or data')
      return
    }

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

      // 獲取主題顏色
      const themeColors = getThemeColors()

      // 準備數據 (按日期升序排列)
      const sortedData = [...chartData.value].reverse()
      const dates = sortedData.map(item => item.trade_date)
      const values = sortedData.map(item => [
        item.open,
        item.close,
        item.low,
        item.high
      ])
      const volumeData = sortedData.map(item => item.shares || 0)
      
      // 計算移動平均線
      const closePrices = sortedData.map(item => parseFloat(item.close))
      const ma5 = calculateMovingAverage(closePrices, 5)
      const ma10 = calculateMovingAverage(closePrices, 10)
      const ma20 = calculateMovingAverage(closePrices, 20)
      
      // 計算布林帶
      const bollingerBands = calculateBollingerBands(closePrices, 20, 2.0)

      // 圖表配置
      const option = {
        backgroundColor: 'transparent',
        // title: {
        //   text: selectedStock.value ? `${selectedStock.value.stock_name} (${selectedStock.value.stock_id})` : '股票圖表',
        //   left: 'center',
        //   textStyle: {
        //     color: themeColors.textColor
        //   }
        // },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          backgroundColor: themeColors.tooltipBackgroundColor,
          borderColor: themeColors.tooltipBorderColor,
          textStyle: {
            color: themeColors.textColor
          }
        },
        legend: {
          data: [
            'K.BAR', 
            'Volume', 
            'MA5', 
            'MA10', 
            'MA20', 
            'BBAND.top', 
            'BBAND.bottom'
          ],
          top: 30,
          textStyle: {
            color: themeColors.textColor
          }
        },
        grid: [
          {
            left: '8%',
            right: '8%',
            top: '12%',
            height: '60%'
          },
          {
            left: '8%',
            right: '8%',
            top: '78%',
            height: '15%'
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { 
              onZero: false,
              lineStyle: {
                color: themeColors.axisLineColor
              }
            },
            axisLabel: {
              color: themeColors.textColor
            },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              z: 100
            }
          },
          {
            type: 'category',
            gridIndex: 1,
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { 
              onZero: false,
              lineStyle: {
                color: themeColors.axisLineColor
              }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          }
        ],
        yAxis: [
          {
            scale: true,
            axisLabel: {
              color: themeColors.textColor
            },
            axisLine: {
              lineStyle: {
                color: themeColors.axisLineColor
              }
            },
            splitLine: {
              lineStyle: {
                color: themeColors.splitLineColor
              }
            },
            splitArea: {
              show: true,
              areaStyle: {
                color: [themeColors.gridColor + '20', themeColors.gridColor + '05']
              }
            }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 50,
            end: 100
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            top: '95%',
            start: 50,
            end: 100,
            textStyle: {
              color: themeColors.textColor
            },
            borderColor: themeColors.axisLineColor,
            fillerColor: themeColors.gridColor + '30',
            handleStyle: {
              color: themeColors.axisLineColor
            },
            selectedDataBackground: {
              lineStyle: {
                color: themeColors.textColor
              },
              areaStyle: {
                color: themeColors.gridColor + '20'
              }
            }
          }
        ],
        series: [
          {
            name: 'K.BAR',
            type: 'candlestick',
            data: values,
            itemStyle: {
              color: '#ec0000',
              color0: '#00da3c',
              borderColor: undefined,
              borderColor0: undefined
            }
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: volumeData,
            itemStyle: {
              color: function(params) {
                const index = params.dataIndex
                const close = values[index][1]
                const open = values[index][0]
                return close >= open ? '#ec0000' : '#00da3c'
              }
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: ma5,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
              color: '#1f77b4',
              width: 1,
              type: 'solid'
            },
            symbol: 'none'
          },
          {
            name: 'MA10',
            type: 'line',
            data: ma10,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
              color: '#2ca02c',
              width: 1,
              type: 'solid'
            },
            symbol: 'none'
          },
          {
            name: 'MA20',
            type: 'line',
            data: ma20,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
              color: '#2c2c2c',
              width: 1,
              type: 'solid'
            },
            symbol: 'none'
          },
          {
            name: 'BBAND.top',
            type: 'line',
            data: bollingerBands.upperBand,
            smooth: true,
            lineStyle: {
              opacity: 0.7,
              color: '#9467bd',
              width: 1,
              type: 'solid'
            },
            symbol: 'none'
          },
          {
            name: 'BBAND.bottom',
            type: 'line',
            data: bollingerBands.lowerBand,
            smooth: true,
            lineStyle: {
              opacity: 0.7,
              color: '#9467bd',
              width: 1,
              type: 'solid'
            },
            symbol: 'none'
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

  // 重新渲染圖表（用於主題變化）
  const rerenderChart = async () => {
    if (chartData.value.length > 0) {
      await renderChart()
    }
  }

  // 清理圖表
  const disposeChart = () => {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  }

  // 組件卸載時清理圖表
  onUnmounted(() => {
    disposeChart()
  })

  return {
    loading,
    error,
    chartData,
    selectedStock,
    chartContainer,
    showMA5,
    showMA10,
    showMA20,
    showMA30,
    loadStockChartData,
    renderChart,
    rerenderChart,
    disposeChart
  }
}
