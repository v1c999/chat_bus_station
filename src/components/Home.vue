<template>
  <div>
    <!-- Navbar with dynamic title -->
    <nav class="navbar">
      <button v-if="selectedRoom" class="back-button" @click="goBack">返回上一頁</button>
      <h1>{{ navbarTitle }}</h1>
    </nav>

    <!-- Content showing either the selected room or available rooms -->
    <div class="content">
      <div v-if="selectedRoom">
        <h2>{{ selectedRoom }}</h2>
      </div>
      <div v-else>
        <div v-if="uniqueFilteredStops.length > 0">
          <ul class="chatroom-list">
            <!-- Bus stops will be shown as chat rooms -->
            <li class="name" v-for="(stop, index) in uniqueFilteredStops" :key="index" @click="selectRoom(stop.name)">
              {{ stop.name }}
            </li>
          </ul>
        </div>
        <div v-else>
          附近無公車站牌
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { useGeolocation } from '@vueuse/core';
import { ref, watchEffect, computed } from 'vue';

// Reactive variables for latitude, longitude, and bus stops
const { coords } = useGeolocation();
const latitude = ref(null);
const longitude = ref(null);
const stops = ref([]);
const filteredStops = ref([]);
const uniqueFilteredStops = ref([]);

// Room selection state
const selectedRoom = ref(null);

// Fetch bus stop data and filter based on location
axios.get('/json/GetStopLocation.json')
  .then(response => {
    stops.value = response.data.BusInfo; // Load bus stop data
  })
  .catch(error => {
    console.error('Error fetching the JSON:', error);
  });

watchEffect(() => {
  if (coords.value) {
    latitude.value = coords.value.latitude;
    longitude.value = coords.value.longitude;

    // Filter bus stops that are within ±0.003 range of latitude/longitude
    filteredStops.value = stops.value.filter(stop => {
      const latDiff = Math.abs(stop.lat - latitude.value);
      const lonDiff = Math.abs(stop.lon - longitude.value);
      return latDiff <= 0.003 && lonDiff <= 0.003;
    });

    // Remove duplicate stops based on name
    const uniqueStops = new Set();
    uniqueFilteredStops.value = filteredStops.value.filter(stop => {
      if (!uniqueStops.has(stop.name)) {
        uniqueStops.add(stop.name);
        return true;
      }
      return false;
    });
  }
});

// Methods for room selection and navigation
const selectRoom = (room) => {
  selectedRoom.value = room;
};

const goBack = () => {
  selectedRoom.value = null;
};

// Dynamic navbar title based on selected room
const navbarTitle = computed(() => {
  return selectedRoom.value ? selectedRoom.value : '可用的聊天室';
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.navbar h1 {
  flex-grow: 1;
}

.back-button {
  position: absolute;
  left: 1rem;
  background-color: #555;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #666;
}

.content {
  margin-top: 4rem;
}

.chatroom-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chatroom-list li {
  width: 90%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f4f4f4;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chatroom-list li:hover {
  background-color: #e0e0e0;
}

.name{
  color: black;
}

@media (min-width: 768px) {
  .chatroom-list li {
    width: 80%;
  }
}
</style>
