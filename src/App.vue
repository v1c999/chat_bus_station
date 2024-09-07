<template>
  <header>
    <div class="title">BusChat!</div>
    <div class="stops">
      公車站名
      <ul>
        <li v-for="(stop, index) in stops" :key="index">{{ stop.name }}</li>
      </ul>
    </div>
  </header>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      stops: [] // Initialize empty array for bus stops
    };
  },
  mounted() {
    // Fetch the JSON data from the public folder
    axios.get('/json/GetStopLocation.json')
      .then(response => {
        this.stops = response.data.BusInfo; // Assign bus stop data to stops
      })
      .catch(error => {
        console.error('Error fetching the JSON:', error);
      });
  }
};
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
</style>

