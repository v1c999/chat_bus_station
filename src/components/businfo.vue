<template>
    <div class="businfo">
      <div class="header">
        <button @click="goBack" class="icon-button">
          <img src="/src/assets/back.png" alt="返回">
        </button>
        <h2>{{ roomName }}</h2>
      </div>
      <div v-if="loading">
        <p class="loading">請稍候...</p>
      </div>
      <div v-else-if="error">
        <p>Error: {{ error }}</p>
      </div>
      <div v-else-if="busEstimates.length">
        <h3>到達時間</h3>
        <ul>
          <li v-for="(bus, index) in busEstimates" :key="index">
            路線 {{ bus.routeNameZh }} ({{ bus.destinationZh }}) - 估計到達時間: 
            <span v-if="bus.EstimateTime > 0">{{ bus.EstimateTime }} 秒</span>
            <span v-else-if="bus.EstimateTime === -1">尚未發車</span>
            <span v-else-if="bus.EstimateTime === -2">交管不停靠</span>
            <span v-else-if="bus.EstimateTime === -3">末班車已過</span>
            <span v-else-if="bus.EstimateTime === -4">今日未營運</span>
          </li>
        </ul>
      </div>
      <div v-else>
        <p class="loading">無將要到達的公車</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import pako from 'pako';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    name: 'BusInfo',
    setup() {
      const route = useRoute();
      const router = useRouter();
      const roomName = ref(route.params.roomName);
      const busEstimates = ref([]);
      const stopId = ref(12345);
      const loading = ref(true);
      const error = ref(null);
  
      const goBack = () => {
        router.push(`/chatroom/${roomName.value}`);
      };
  
      const fetchAndDecompressData = async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const decompressedData = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
        return JSON.parse(decompressedData);
      };
  
      const fetchBusEstimateTime = async () => {
        try {
          loading.value = true;
          error.value = null;
          
          const [routeData, estimateTimeData] = await Promise.all([
            fetchAndDecompressData('https://tcgbusfs.blob.core.windows.net/blobbus/GetRoute.gz'),
            fetchAndDecompressData('https://tcgbusfs.blob.core.windows.net/blobbus/GetEstimateTime.gz')
          ]);
  
          console.log('Route Data:', routeData);
          console.log('Estimate Time Data:', estimateTimeData);
  
          const estimateTimeArray = estimateTimeData.EstimateTime || [];
          
          const busesAtStop = estimateTimeArray.filter(bus => bus.StopID === stopId.value);
  
          busEstimates.value = busesAtStop.map(bus => {
            const route = routeData.Route.find(route => route.Id === bus.RouteID);
            return {
              routeNameZh: route?.nameZh || 'Unknown',
              destinationZh: route?.destinationZh || 'Unknown',
              EstimateTime: bus.EstimateTime,
              GoBack: bus.GoBack
            };
          });
  
          console.log('Processed Bus Info:', busEstimates.value);
        } catch (err) {
          console.error('Error fetching bus data:', err);
          error.value = 'Failed to load bus data. Please try again later.';
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(() => {
        fetchBusEstimateTime();
      });
  
      return {
        roomName,
        goBack,
        busEstimates,
        loading,
        error
      };
    }
  };
  </script>
  
<style scoped>
.businfo {   
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: #f4f4f4;
    position: fixed;
    top: 0;
    left: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #36a3b2;
  color: white;
}

h2 {
    margin: 0;
    text-align: center;
    flex-grow: 1;
}

.icon-button {
    background: none;
    border: none;
    cursor: pointer;
}
  
  .icon-button img {
    width: 24px;
    height: 24px;
  }
  
  .icon-button:hover {
    transform: scale(1.3);
  }

  .loading {
    text-align: center;
    font-size: 30px;
    font-weight: 500;
    padding: 30px;
    margin-top: 50px;
  }
  </style>
  