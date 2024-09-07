

<template>
  <div id="app">
    <RouterView></RouterView>  <!-- 這裡用來顯示對應路由的內容 -->
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import axios from 'axios';
import { useGeolocation } from '@vueuse/core';
import { ref, watchEffect } from 'vue';

// Use the useGeolocation hook to get latitude and longitude
const { coords } = useGeolocation();

// Reactive variables for latitude and longitude
const latitude = ref(null);
const longitude = ref(null);

// Reactive variable for stops and filtered stops
const stops = ref([]);
const filteredStops = ref([]);

// Watch for changes in coords and update latitude/longitude
watchEffect(() => {
  if (coords.value) {
    latitude.value = coords.value.latitude;
    longitude.value = coords.value.longitude;

    // Filter the bus stops that are within ±0.01 latitude and longitude range
    if (stops.value.length > 0) {
      filteredStops.value = stops.value.filter(stop => {
        const latDiff = Math.abs(stop.lat - latitude.value);
        const lonDiff = Math.abs(stop.lon - longitude.value);
        return latDiff <= 0.001 && lonDiff <= 0.001;
      });
    }
  }
});

// Fetch bus stop data
axios.get('/json/GetStopLocation.json')
  .then(response => {
    stops.value = response.data.BusInfo; // Assign bus stop data to stops
  })
  .catch(error => {
    console.error('Error fetching the JSON:', error);
  });

function toChatRoom(){
  console.log('clicked!');
}
</script>



<style scoped>
header {
  background-color: white;
  color: black;
}
.title {
  font-size: 50px;
  margin-bottom: 20px;
}
.stops ul {
  padding-left: 20px;
}
.stops li {
  margin-bottom: 10px;
}
.location-info {
  margin-top: 20px;
}
</style>
