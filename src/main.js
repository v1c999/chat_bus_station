import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { db, auth, analytics } from './firebase'

const app = createApp(App)
app.config.globalProperties.$db = db
app.config.globalProperties.$auth = auth
app.use(router)

app.mount('#app')