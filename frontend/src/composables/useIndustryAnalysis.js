import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { usePostgres } from './usePostgres'

export function useIndustryAnalysis() {
  const { loading, error, executeQuery } = usePostgres()
  const industryData = ref([])
  const chartContainer = ref(null)
  let chartInstance = null

  // 載入產業分析數據
  const loadIndustryData = async () => {
    try {
      const query = `
        SELECT 
          COALESCE(mr.industry_type, '未分類') as industry_type,
          COALESCE(sp.market, '未分類') as market,
          COUNT(DISTINCT sp.stock_id) as stock_count,
          CASE 
            WHEN SUM(sp.open) > 0 
            THEN ROUND(((SUM(sp.close) - SUM(sp.open)) / SUM(sp.open)) * 100, 2)
            ELSE 0 
          END as avg_change_percent,
          COALESCE(SUM(sp.shares), 0) as total_volume
        FROM tw_stock_price sp
        LEFT JOIN (
          SELECT DISTINCT ON (stock_id)
              stock_id, industry_type, report_month
          FROM monthly_revenue
          ORDER BY stock_id, report_month DESC
        ) mr ON sp.stock_id = mr.stock_id
        WHERE sp.trade_date = (SELECT MAX(trade_date) FROM tw_stock_price)
        GROUP BY COALESCE(mr.industry_type, '未分類'), COALESCE(sp.market, '未分類')
      `
      
      const result = await executeQuery(query, 5000, 0)
      
      if (result.success) {
        // 確保數據類型正確並在前端進行排序
        const processedData = result.data.map(item => ({
          ...item,
          avg_change_percent: parseFloat(item.avg_change_percent) || 0,
          total_volume: parseFloat(item.total_volume) || 0,
          stock_count: parseInt(item.stock_count) || 0
        }))
        
        industryData.value = processedData.sort((a, b) => b.total_volume - a.total_volume)
        console.log('產業分析數據載入成功:', result.data.length, '筆記錄')
      } else {
        throw new Error(result.message || '查詢產業分析數據失敗')
      }
    } catch (err) {
      console.error('載入產業分析數據失敗:', err)
      throw err
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
  const renderChart = async (chartType = 'change_percent', dataSource = null) => {
    const dataToUse = dataSource || industryData.value
    if (!chartContainer.value || dataToUse.length === 0) {
      console.log('IndustryAnalysis: renderChart aborted - no container or data')
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

      // 準備數據 - 按市場分組
      let categories, data, title, yAxisName, formatter, series

      // 按市場分組數據
      const tseData = dataToUse.filter(item => item.market === 'TSE')
      const otcData = dataToUse.filter(item => item.market === 'OTC')

      switch (chartType) {
        case 'change_percent':
          categories = [...new Set([...tseData.map(item => item.industry_type), ...otcData.map(item => item.industry_type)])]
          title = '產業平均漲跌幅分析'
          yAxisName = '漲跌幅 (%)'
          formatter = '{b}: {c}%'
          
          // 創建上市和上櫃的數據系列
          series = [
            {
              name: '上市',
              type: 'bar',
              data: categories.map(industry => {
                const item = tseData.find(d => d.industry_type === industry)
                return item ? item.avg_change_percent : 0
              }),
              itemStyle: {
                color: '#ec0000',
                borderRadius: [4, 4, 0, 0]
              }
            },
            {
              name: '上櫃',
              type: 'bar',
              data: categories.map(industry => {
                const item = otcData.find(d => d.industry_type === industry)
                return item ? item.avg_change_percent : 0
              }),
              itemStyle: {
                color: '#00da3c',
                borderRadius: [4, 4, 0, 0]
              }
            }
          ]
          break
        case 'volume':
          categories = [...new Set([...tseData.map(item => item.industry_type), ...otcData.map(item => item.industry_type)])]
          title = '產業總交易量分析'
          yAxisName = '交易量'
          formatter = '{b}: {c}'
          
          // 創建上市和上櫃的數據系列
          series = [
            {
              name: '上市',
              type: 'bar',
              data: categories.map(industry => {
                const item = tseData.find(d => d.industry_type === industry)
                return item ? item.total_volume : 0
              }),
              itemStyle: {
                color: '#1f77b4'
              }
            },
            {
              name: '上櫃',
              type: 'bar',
              data: categories.map(industry => {
                const item = otcData.find(d => d.industry_type === industry)
                return item ? item.total_volume : 0
              }),
              itemStyle: {
                color: '#ff7f0e'
              }
            }
          ]
          break
        default:
          categories = [...new Set([...tseData.map(item => item.industry_type), ...otcData.map(item => item.industry_type)])]
          title = '產業平均漲跌幅分析'
          yAxisName = '漲跌幅 (%)'
          formatter = '{b}: {c}%'
          
          series = [
            {
              name: '上市',
              type: 'bar',
              data: categories.map(industry => {
                const item = tseData.find(d => d.industry_type === industry)
                return item ? item.avg_change_percent : 0
              }),
              itemStyle: {
                color: '#ec0000',
                borderRadius: [4, 4, 0, 0]
              }
            },
            {
              name: '上櫃',
              type: 'bar',
              data: categories.map(industry => {
                const item = otcData.find(d => d.industry_type === industry)
                return item ? item.avg_change_percent : 0
              }),
              itemStyle: {
                color: '#00da3c',
                borderRadius: [4, 4, 0, 0]
              }
            }
          ]
      }

      // 圖表配置
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: title,
          left: 'center',
          textStyle: {
            color: themeColors.textColor,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: themeColors.tooltipBackgroundColor,
          borderColor: themeColors.tooltipBorderColor,
          textStyle: {
            color: themeColors.textColor
          },
          formatter: formatter
        },
        legend: {
          data: chartType === 'change_percent' ? ['上市', '上櫃'] : ['上市', '上櫃'],
          top: 10,
          textStyle: {
            color: themeColors.textColor
          }
        },
        grid: {
          left: '15%',
          right: '10%',
          top: '15%',
          bottom: '20%',
          containLabel: true
        },
        // 漲跌幅圖表特殊配置
        ...(chartType === 'change_percent' && {
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 100
            },
            {
              show: true,
              type: 'slider',
              top: '90%',
              start: 0,
              end: 100,
              textStyle: {
                color: themeColors.textColor
              },
              borderColor: themeColors.axisLineColor,
              fillerColor: themeColors.gridColor + '30',
              handleStyle: {
                color: themeColors.axisLineColor
              }
            }
          ]
        }),
        xAxis: {
          type: 'value',
          name: yAxisName,
          nameTextStyle: {
            color: themeColors.textColor
          },
          axisLabel: {
            color: themeColors.textColor,
            formatter: chartType === 'volume' ? function(value) {
              if (value >= 100000000) {
                return (value / 100000000).toFixed(1) + '億'
              } else if (value >= 10000) {
                return (value / 10000).toFixed(1) + '萬'
              }
              return value
            } : chartType === 'change_percent' ? function(value) {
              return value + '%'
            } : '{value}'
          },
          axisLine: {
            lineStyle: {
              color: themeColors.axisLineColor
            }
          },
          splitLine: {
            lineStyle: {
              color: themeColors.splitLineColor,
              type: chartType === 'change_percent' ? 'dashed' : 'solid'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            color: themeColors.textColor,
            fontSize: 10,
            interval: 0  // 強制顯示所有標籤
          },
          axisLine: {
            lineStyle: {
              color: themeColors.axisLineColor
            }
          },
          splitLine: {
            show: false
          }
        },
        series: series.map(s => ({
          ...s,
          coordinateSystem: 'cartesian2d',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          // 漲跌幅圖表特殊配置
          ...(chartType === 'change_percent' && {
            markLine: {
              data: [
                {
                  xAxis: 0,
                  lineStyle: {
                    color: themeColors.axisLineColor,
                    type: 'dashed'
                  },
                  label: {
                    formatter: '0%',
                    position: 'end'
                  }
                }
              ]
            }
          })
        }))
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
      console.error('載入產業分析圖表失敗:', error)
    }
  }

  // 重新渲染圖表（用於主題變化）
  const rerenderChart = async (chartType = 'change_percent') => {
    if (industryData.value.length > 0) {
      await renderChart(chartType)
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
    industryData,
    chartContainer,
    loadIndustryData,
    renderChart,
    rerenderChart,
    disposeChart
  }
}
