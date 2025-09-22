<template>
  <div v-if="tableDetail" class="section">
    <h3>資料表詳細信息: {{ tableDetail.table_info.table_name }}</h3>
    <div class="result">
      <div><strong>行數:</strong> {{ tableDetail.table_info.row_count || '未知' }}</div>
      <div><strong>欄位:</strong></div>
      <div class="columns-list">
        <div v-for="column in tableDetail.columns" :key="column.column_name" class="column-item">
          <div class="column-name">{{ column.column_name }}</div>
          <div class="column-type">{{ column.data_type }}</div>
          <div class="column-nullable">{{ column.is_nullable ? '可空' : '不可空' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { usePostgres } from '../../composables/usePostgres'

export default {
  name: 'TableDetail',
  props: {
    tableName: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const { loading, error, getTableDetail } = usePostgres()
    const tableDetail = ref(null)

    const loadTableDetail = async (tableName) => {
      if (!tableName) return
      
      try {
        const result = await getTableDetail(tableName)
        tableDetail.value = result
      } catch (err) {
        console.error('獲取資料表詳細信息失敗:', err)
      }
    }

    watch(() => props.tableName, (newTableName) => {
      if (newTableName) {
        loadTableDetail(newTableName)
      } else {
        tableDetail.value = null
      }
    }, { immediate: true })

    return {
      loading,
      error,
      tableDetail
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

.result {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}

.columns-list {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.column-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  padding: 0.5rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

.column-name {
  font-weight: 600;
  color: var(--text-primary);
}

.column-type {
  color: var(--text-secondary);
}

.column-nullable {
  color: var(--info-color);
  font-size: 0.8rem;
}
</style>
