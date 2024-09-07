<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView></RouterView>  <!-- 這裡用來顯示對應路由的內容 -->
  </div>
</template>

<style scoped>
header {
  background-color: white;
  color: black;
}
.title {
  font-size: 50px;
}
</style>
