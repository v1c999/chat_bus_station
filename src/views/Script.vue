<template>
  <div class="p-4">
    <input
      v-model="stationName"
      placeholder="輸入站牌名稱"
      class="border p-2 mb-2"
    />
    <button
      @click="fetchBusInfo"
      class="bg-blue-500 text-white p-2 rounded"
    >
      獲取公車資訊
    </button>
    
    <p v-if="loading">正在加載數據...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>
    
    <div v-if="busInfo.length > 0" class="mt-4">
      <h2 class="text-xl font-bold mb-2">{{ stationName }} 站牌公車資訊:</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(bus, index) in busInfo" :key="index" class="border rounded p-4">
          <h3 class="font-bold">{{ bus.routeName }}</h3>
          <p>方向: {{ bus.direction }}</p>
          <p>終點站: {{ bus.destination }}</p>
          <p>預計到站時間: {{ formatEstimateTime(bus.estimateTime) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const stationName = ref('')
    const busInfo = ref([])
    const error = ref(null)
    const loading = ref(false)

    const fetchBusInfo = async () => {
      loading.value = true
      error.value = null
      busInfo.value = []

      try {
        // 獲取站牌ID
        const stopResponse = await axios.get('http://localhost:3005/getstopid')
        const stopData = stopResponse.data.data.BusInfo
        const stops = stopData.filter(stop => stop.nameZh === stationName.value)

        if (stops.length === 0) {
          error.value = `未找到名稱為 "${stationName.value}" 的站牌`
          loading.value = false
          return
        }

        // 獲取估計到站時間
        const estimateResponse = await axios.get('http://localhost:3005/getrouteid')
        const estimateData = estimateResponse.data.data.BusInfo

        // 獲取路線名稱和終點站資訊
        const routeResponse = await axios.get('http://localhost:3005/getroutename')
        const routeData = routeResponse.data.data.BusInfo

        // 整合數據
        const relevantEstimates = estimateData.filter(item => 
          stops.some(stop => stop.Id === item.StopID) && 
          (item.GoBack === '0' || item.GoBack === '1')
        )

        busInfo.value = relevantEstimates.map(estimate => {
          const route = routeData.find(r => r.Id === estimate.RouteID)
          return {
            routeId: estimate.RouteID,
            routeName: route?.nameZh || '未知路線',
            estimateTime: estimate.EstimateTime,
            direction: estimate.GoBack === '0' ? '去程' : '回程',
            destination: estimate.GoBack === '0' ? route?.destinationZh : route?.departureZh
          }
        })

        console.log('找到的公車數量:', busInfo.value.length)

      } catch (err) {
        console.error('獲取數據時發生錯誤:', err)
        error.value = '獲取數據時發生錯誤'
      } finally {
        loading.value = false
      }
    }

    const formatEstimateTime = (time) => {
      if (time === undefined) return '無資料'
      if (time === '-1') return '尚未發車'
      if (time === '-2') return '交管不停靠'
      if (time === '-3') return '末班車已過'
      if (time === '-4') return '今日未營運'
      return `${Math.floor(time / 60)} 分鐘`
    }

    return {
      stationName,
      busInfo,
      error,
      loading,
      fetchBusInfo,
      formatEstimateTime
    }
  }
}
</script>