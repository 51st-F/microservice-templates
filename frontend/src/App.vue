<template>
  <div>
    <h1>前端應用</h1>
    
    <!-- Hello World 部分 -->
    <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
      <h2>Hello World 測試</h2>
      <p>從後端獲取的消息：</p>
      <div v-if="loading">載入中...</div>
      <div v-else-if="error" style="color: red;">錯誤: {{ error }}</div>
      <div v-else>
        <p><strong>消息:</strong> {{ message }}</p>
        <p><strong>時間戳:</strong> {{ timestamp }}</p>
      </div>
      <button @click="fetchHelloWorld">重新獲取消息</button>
    </div>

    <!-- MongoDB 測試部分 -->
    <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
      <h2>MongoDB 測試</h2>
      <button @click="createSampleMessage" :disabled="mongoLoading" style="margin-right: 10px;">
        {{ mongoLoading ? '寫入中...' : '創建示例消息到 MongoDB' }}
      </button>
      <button @click="fetchTestMessages" :disabled="mongoLoading">
        {{ mongoLoading ? '載入中...' : '獲取所有測試消息' }}
      </button>
      
      <div v-if="mongoError" style="color: red; margin-top: 10px;">
        錯誤: {{ mongoError }}
      </div>
      
      <div v-if="mongoResult" style="margin-top: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 3px;">
        <h3>結果:</h3>
        <pre>{{ JSON.stringify(mongoResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      message: '',
      timestamp: '',
      loading: false,
      error: null,
      mongoLoading: false,
      mongoError: null,
      mongoResult: null
    }
  },
  async mounted() {
    await this.fetchHelloWorld()
  },
  methods: {
    async fetchHelloWorld() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('http://localhost:8000/hello')
        this.message = response.data.message
        this.timestamp = response.data.timestamp
        console.log('從後端獲取的消息:', response.data)
      } catch (error) {
        this.error = '無法連接到後端服務'
        console.error('API 調用失敗:', error)
      } finally {
        this.loading = false
      }
    },
    async createSampleMessage() {
      this.mongoLoading = true
      this.mongoError = null
      this.mongoResult = null
      try {
        const response = await axios.post('http://localhost:8000/test-messages/sample')
        this.mongoResult = response.data
        console.log('MongoDB 寫入成功:', response.data)
      } catch (error) {
        this.mongoError = '無法寫入 MongoDB'
        console.error('MongoDB 寫入失敗:', error)
      } finally {
        this.mongoLoading = false
      }
    },
    async fetchTestMessages() {
      this.mongoLoading = true
      this.mongoError = null
      this.mongoResult = null
      try {
        const response = await axios.get('http://localhost:8000/test-messages/')
        this.mongoResult = {
          message: '成功獲取所有測試消息',
          count: response.data.length,
          data: response.data
        }
        console.log('MongoDB 讀取成功:', response.data)
      } catch (error) {
        this.mongoError = '無法從 MongoDB 讀取數據'
        console.error('MongoDB 讀取失敗:', error)
      } finally {
        this.mongoLoading = false
      }
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  padding: 20px;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
button:hover {
  background-color: #0056b3;
}
</style>