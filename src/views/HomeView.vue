<template>
  <div> 
    <nav class="navbar">
      <button v-if="selectedRoom" class="back-button" @click="goBack">返回上一頁</button>
      <h1>{{ navbarTitle }}</h1>
    </nav>
    <div class="content">
      <div v-if="selectedRoom">
        <h2>{{ selectedRoom }}</h2>
      </div>
      <div v-else>
        <div v-if="chatRooms.length > 0">
          <ul class="chatroom-list">
            <li v-for="(room, index) in chatRooms" :key="index" @click="selectRoom(room)">
              {{ room }}
            </li>
          </ul>
        </div>
        <div v-else>
          暫無聊天室
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatRooms: ["聊天室 1", "聊天室 2", "聊天室 3"], // 這裡可以動態填充聊天室列表
      selectedRoom: null, // 用來儲存被選中的聊天室
    };
  },
  computed: {
    navbarTitle() {
      return this.selectedRoom ? this.selectedRoom : '可用的聊天室';
    },
  },
  methods: {
    selectRoom(room) {
      this.selectedRoom = room;
    },
    goBack() {
      this.selectedRoom = null;
    },
  },
};
</script>

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000; /* 確保 navbar 位於最上層 */
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
  margin-top: 4rem; /* 確保內容不被 navbar 擋住 */
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
  cursor: pointer; /* 增加光標樣式以顯示可點擊 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chatroom-list li:hover {
  background-color: #e0e0e0; /* 增加滑鼠懸停效果 */
}

@media (min-width: 768px) {
  .chatroom-list li {
    width: 80%;
  }

  .navbar {
    width: 100%;
  }
}
</style>
