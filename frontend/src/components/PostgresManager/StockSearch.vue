<template>
  <div class="search-section">
    <div class="search-box">
      <input 
        :value="searchQuery" 
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text" 
        placeholder="搜尋股票代號、名稱、市場或產業類型..." 
        class="search-input"
      />
      <div v-if="searchQuery" class="search-clear" @click="$emit('clear')">
        ✕
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockSearch',
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  emits: ['update:searchQuery', 'clear']
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .search-box {
    max-width: 100%;
  }
}
</style>
