<template>
    <div class="chat-room">
    <div class="header">
      <button @click="goBack" class="icon-button">
        <img src="/src/assets/back.png" alt="返回">
      </button>
      <h2>{{ roomName }}</h2>
      <button @click="toggleBusInfo" class="icon-button">
        {{ showBusInfo ? '關閉公車資訊' : '查看公車資訊' }}
      </button>
    </div>
    <div v-if="showBusInfo" class="bus-info-overlay" @click="closeBusInfo">
      <div class="bus-info-modal" @click.stop>
        <h3>公車資訊 🚌💭</h3>
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
        </div>

        <table v-else class="bus-info-table">
          <thead>
            <tr>
              <th>路線</th>
              <th>到站時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(bus, index) in busInfo" :key="index" :class="{ 'urgent': bus.isUrgent }">
              <td>{{ bus.route }}</td>
              <td>{{ bus.arrivalTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
      <div class="messages" ref="messagesContainer">
        
        <div v-for="message in messages" :key="message.id" class="message-container" :class="{ 'user-message': message.userId === userId }">
          <div class="message-author">{{ message.userName }}</div>
          <div class="message-content-wrapper">
            <div class="message-content">{{ message.text }}</div>
            <div class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      <div class="input-area">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="輸入訊息..." :disabled="isSending" />
        <button @click="sendMessage" class="send" :disabled="isSending">送出</button>
      </div>
    </div>
  </template>
  
  <script>
 import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDatabase, ref as dbRef, push, onChildAdded, off } from 'firebase/database';
import axios from 'axios';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const roomName = ref(route.params.roomName);
    const stationName = ref(decodeURIComponent(route.params.roomName)); 
    const messages = ref([]);
    const newMessage = ref('');
    const messagesContainer = ref(null);
    const db = getDatabase();
    const userId = ref(getUserId());
    const userName = ref(getUserName(roomName.value));
    const roomRef = dbRef(db, `chatrooms/${roomName.value}`);
    const isSending = ref(false);
    const showBusInfo = ref(false);
    const busInfo = ref([]);
    const isLoading = ref(false);
    const toggleBusInfo = async () => {
      showBusInfo.value = !showBusInfo.value;
      if (showBusInfo.value) {
        await fetchBusInfo();
      }
    };

    const fetchBusInfo = async () => {
        isLoading.value = true;
      try {
        const stopResponse = await axios.get('http://localhost:3005/getstopid');
        const stopData = stopResponse.data.data.BusInfo;
        const stops = stopData.filter(stop => stop.nameZh === stationName.value);

        if (stops.length === 0) {
          console.error(`未找到名稱為 "${stationName.value}" 的站牌`);
          return;
        }

        const estimateResponse = await axios.get('http://localhost:3005/getrouteid');
        const estimateData = estimateResponse.data.data.BusInfo;

        const routeResponse = await axios.get('http://localhost:3005/getroutename');
        const routeData = routeResponse.data.data.BusInfo;

        const relevantEstimates = estimateData.filter(item => 
          stops.some(stop => stop.Id === item.StopID) && 
          (item.GoBack === '0' || item.GoBack === '1')
        );

        busInfo.value = relevantEstimates.map(estimate => {
          const route = routeData.find(r => r.Id === estimate.RouteID);
          const estimateTimeNumber = parseInt(estimate.EstimateTime);
          return {
            route: `${route?.nameZh || '未知路線'} - ${estimate.GoBack === '0' ? route?.destinationZh : route?.departureZh}`,
            arrivalTime: formatEstimateTime(estimateTimeNumber),
            estimateTime: estimateTimeNumber,
            isUrgent: estimateTimeNumber >= 0 && estimateTimeNumber <= 239
          };
        }).sort((a, b) => {
          if (isNaN(a.estimateTime) || a.estimateTime < 0) return 1;
          if (isNaN(b.estimateTime) || b.estimateTime < 0) return -1;
          return a.estimateTime - b.estimateTime;
        });



      } catch (err) {
        console.error('獲取數據時發生錯誤:', err);
      } finally {
        isLoading.value = false;
      }
    };


    const formatEstimateTime = (time) => {
      if (time === undefined) return '無資料';
      if (time === '-1') return '尚未發車';
      if (time === '-2') return '交管不停靠';
      if (time === '-3') return '末班車已過';
      if (time === '-4') return '今日未營運';
      return `${Math.floor(time / 60)} 分鐘`;
    };

      const closeBusInfo = () => {
        showBusInfo.value = false;
      };
      function getUserId() {
        let id = localStorage.getItem('userId');
        if (!id) {
            id = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', id);
        }
        return id;
    }

    function getUserName(roomName) {
      const nicknames = JSON.parse(localStorage.getItem('roomNicknames') || '{}');
      if (!nicknames[roomName]) {
        nicknames[roomName] = generateRandomNickname();
        localStorage.setItem('roomNicknames', JSON.stringify(nicknames));
      }
      return nicknames[roomName];
    }

    function generateRandomNickname() {
      const adjectives = ["台北", "101", "北投", "城市", "北市", "信義", "北投", "士林", "中山", "北車", "松山", "貓空", "陽明", "大稻埕", "天母", "貓纜", "西門", "北城", "北捷", "忠孝路", "內湖", "萬隆", "東區", "大安公園", "城市", "忠孝東路", "中正"];
      const nouns = ["之光", "小太陽", "小天使", "探索者", "飛鷹", "夢想家", "暖心人", "夜行者", "智者", "追夢人", "飛鳥", "旅人", "山行者", "新星", "茶人", "文青", "心跳", "小精靈", "旅行家", "潛行者", "流浪者", "小俠", "先鋒", "勇者", "夜影", "詩人", "路旅者", "陽光", "小鹿", "夢想者", "藝人", "星辰", "潮人", "騎士", "小仙女", "小虎", "風箏", "微笑", "浪子", "街舞者", "霓虹", "陽光使者", "小太陽", "星光", "築夢人", "漫步者", "火焰", "追風"];
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${randomAdjective}${randomNoun}`;
    }
  
      const goBack = () => {
        router.push('/');
      };
  
      onMounted(() => {
        onChildAdded(roomRef, (snapshot) => {
          const message = snapshot.val();
          messages.value.push(message);
          nextTick(() => {
            if (messagesContainer.value) {
              messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
          });
        });
      });
  
      onUnmounted(() => {
        off(roomRef);
      });
  
      const sendMessage = () => {
      if (newMessage.value.trim() && !isSending.value) {
        isSending.value = true;
        push(roomRef, {
          userId: userId.value,
          userName: userName.value,
          text: newMessage.value.trim(),
          timestamp: Date.now()
        }).then(() => {
          newMessage.value = '';
          setTimeout(() => {
            isSending.value = false;
          }, 1000); 
        }).catch((error) => {
          console.error('Error sending message:', error);
          isSending.value = false;
        });
      }
    };
  
      const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };
  
      return {
        roomName,
        messages,
        newMessage,
        sendMessage,
        messagesContainer,
        goBack,
        toggleBusInfo,
        showBusInfo,
        isSending,
        userName,
        userId,
        formatTimestamp,
        busInfo,
        closeBusInfo,
        stationName,
        showBusInfo,
        isLoading,

      };
    }
  }
  </script>
  
  <style scoped>
  .bus-info-table .urgent {
  color: #36a3b2;
  font-weight: bold;
}
  .loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  border-top-color: #36a3b2;
  animation: spin 1s ease-in-out infinite;
  -webkit-animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
@-webkit-keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}

.bus-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.bus-info-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 70%;
  width: 85%;
  overflow-y: auto;
}

.bus-info-modal h3 {
  margin-top: 0;
  color: #36a3b2;
  margin-bottom: 15px;
}

.bus-info-table {
  width: 100%;
  border-collapse: collapse;
}

.bus-info-table th,
.bus-info-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.bus-info-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.bus-info-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.bus-info-table tr:hover {
  background-color: #f5f5f5;
}

.messages {
  position: relative;
}
.chat-room {
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
  padding: 10px;
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

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.message-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  max-width: 80%;
  align-self: flex-start;
}

.message-content-wrapper {
  display: flex;
  align-items: flex-end;
}

.message-content {
  padding: 10px 15px;
  background-color: #36a4b285;
  color: white;
  border-radius: 20px;
  word-wrap: break-word;
  display: inline-block;
  max-width: 100%;
}

.user-message .message-content-wrapper {
  flex-direction: row-reverse;
}


.user-message {
  align-self: flex-end;
}

.user-message .message-content {
  color: #4a4f52;
  background-color: #ccd5d7;
}

.message-author {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.user-message .message-author {
  text-align: right;
}

.input-area {
  display: flex;
  padding: 20px;
  background-color: white;
}

input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 16px;
  margin-right: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #36a3b2;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.send:hover:not(:disabled) {
  background-color: #4a4f52;
}

.icon-button:hover {
  transform: scale(1.3);
}

.message-timestamp {
  font-size: 10px;
  color: #999;
  margin-left: 10px;
}

.user-message .message-timestamp {
  margin-left: 0;
  margin-right: 10px; 
}


@media (max-width: 768px) {
  .message-container {
    max-width: 90%;
  }

  input {
    font-size: 14px;
  }

  button {
    font-size: 14px;
    padding: 10px 15px;
  }
}
</style>