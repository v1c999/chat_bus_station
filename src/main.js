import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
    apiKey: "AIzaSyAlrKe9MDKp_a13DUkbMR6UAyGUsy5tbfs",
    authDomain: "townpass-eb953.firebaseapp.com",
    projectId: "townpass-eb953",
    storageBucket: "townpass-eb953.appspot.com",
    messagingSenderId: "932582215192",
    appId: "1:932582215192:web:b38f83f9a70f5539763d6d",
    measurementId: "G-9W5RDWYBN1"
  };

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const analytics = getAnalytics(firebaseApp);

const app = createApp(App)
app.config.globalProperties.$db = db
app.use(router)

app.mount('#app')
