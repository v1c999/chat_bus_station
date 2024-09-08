<template>
    <div>
      <button @click="fetchBusInfo">獲取站牌資訊</button>
      
      <div v-if="busIds.length > 0">
        <h2>站牌 ID 列表:</h2>
        <ul>
          <li v-for="id in busIds" :key="id">{{ id }}</li>
        </ul>
      </div>
      <div v-if="routeIds.length > 0">
        <h2>Route ID 列表:</h2>
        <ul>
          <li v-for="routeId in routeIds" :key="routeId">{{ routeId }}</li>
        </ul>
      </div>
      <div v-if="routeNames.length > 0">
        <h2>Route Name 列表:</h2>
        <ul>
          <li v-for="name in routeNames" :key="name">{{ name }}</li>
        </ul>
      </div>
      <div v-else-if="error">
        {{ error }}
      </div>
      <div v-else-if="loading">
        正在加載數據...
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import axios from 'axios'
  
  export default {
    setup() {
      const roomName = '臺大綜合體育館'
      const busIds = ref([])
      const routeIds = ref([])
      const routeNames = ref([])  // 用來存儲組合後的字串
      const error = ref(null)
      const loading = ref(false)
  
      const fetchBusInfo = async () => {
        loading.value = true
        error.value = null
        busIds.value = []
        routeIds.value = []
        routeNames.value = []  // 清空之前的數據
  
        try {
          const response = await axios.get('http://localhost:3005/getstopid')
          const data = response.data
          if (data && data.data.BusInfo) {
            const filteredBuses = data.data.BusInfo.filter(bus => bus.nameZh === roomName)
            busIds.value = filteredBuses.map(bus => bus.Id)
            console.log('Bus IDs:', busIds.value) // 在控制台輸出所有匹配的 bus.Id
            if (busIds.value.length === 0) {
              error.value = `未找到名稱為 "${roomName}" 的站牌資訊`
            } else {
              await fetchRouteIds()
            }
          } else {
            error.value = '無法從API獲取到BusInfo數據'
          }
        } catch (err) {
          console.error('獲取數據時發生錯誤:', err)
          error.value = '獲取數據時發生錯誤'
        } finally {
          loading.value = false
        }
      }
  
      const fetchRouteIds = async () => {
        try {
          const response = await axios.get('http://localhost:3005/getrouteid')
          const data = response.data
          if (data && data.data.BusInfo) {
            // 遍歷每個busId，找到與其對應的RouteID
            busIds.value.forEach(busId => {
              const matchingRoutes = data.data.BusInfo.filter(item => item.StopID === busId)
              matchingRoutes.forEach(route => {
                if (route.GoBack === '0' || route.GoBack === '1') {
      const combinedValue = `${route.RouteID} ${route.GoBack}`;
      routeIds.value.push(combinedValue);
    }
  });
            })
            console.log('Route IDs:', routeIds.value) // 在控制台輸出所有找到的 RouteID
  
            // 在找到 RouteID 之後，繼續調用 getRouteNames
            await fetchRouteNames()
          } else {
            error.value = '無法從API獲取到 RouteID數據'
          }
        } catch (err) {
          console.error('獲取 RouteID數據時發生錯誤:', err)
          error.value = '獲取 RouteID數據時發生錯誤'
        }
      }
  
      const fetchRouteNames = async () => {
  try {
    const response = await axios.get('http://localhost:3005/getroutename');
    const data = response.data;

    if (data && data.data.BusInfo) {
      // Create arrays to hold routeIds and directions separately
      const routeIdArray = [];
      const directionArray = [];

      // Iterate through each routeId and direction, find the matching nameZh and destinationZh
      routeIds.value.forEach((routeIdWithDirection) => {
        // Split routeIdWithDirection into routeId and direction
        const [routeId, direction] = routeIdWithDirection.split(' ');

        // Push the routeId and direction into their respective arrays
        routeIdArray.push(routeId);
        directionArray.push(direction);

        // Find the route in the data that matches the routeId
        const matchingRoute = data.data.BusInfo.find(route => String(route.Id) === routeId );

        if (matchingRoute) {
          console.log('Matching Route:', matchingRoute);
          const routeName = `${matchingRoute.nameZh} -> ${matchingRoute.destinationZh}`;
          routeNames.value.push(routeName);
        }
      });
    } else {
      error.value = '無法從API獲取到 RouteName數據';
    }
  } catch (err) {
    console.error('獲取 RouteName數據時發生錯誤:', err);
    error.value = '獲取 RouteName數據時發生錯誤';
  }
};




  
      return {
        busIds,
        routeIds,
        routeNames,
        error,
        loading,
        fetchBusInfo
      }
    }
  }
  </script>
  