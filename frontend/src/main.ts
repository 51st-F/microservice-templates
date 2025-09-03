import { createApp } from 'vue'
import App from './App.vue'

console.log('Main.ts loaded')
console.log('App component:', App)

const app = createApp(App)
app.mount('#app')

console.log('App mounted')