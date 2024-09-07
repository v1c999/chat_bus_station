<template>
    <div class="chat-room">
      <div class="header">
        <button @click="goBack" class="icon-button">
          <img src="/src/assets/back.png">
        </button>
        <h2>{{ roomName }}</h2>
        <button @click="showBusInfo" class="icon-button">公車資訊</button>
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" class="message-container" :class="{ 'user-message': message.userName === userName }">
          <div class="message-author">{{ message.userName }}</div>
          <div class="message-content">{{ message.text }}</div>
        </div>
      </div>
      <div class="input-area">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="輸入訊息..." />
        <button @click="sendMessage">送出</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getDatabase, ref as dbRef, push, onChildAdded, off } from 'firebase/database';
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const roomName = ref(route.params.roomName);
      const messages = ref([]);
      const newMessage = ref('');
      const messagesContainer = ref(null);
      const db = getDatabase();
      const userName = ref(generateRandomNickname());
      const roomRef = dbRef(db, `chatrooms/${roomName.value}`);
  
      const goBack = () => {
        router.push('/');
      };
  
      const showBusInfo = () => {
        console.log('顯示公車資訊');
      };
  
      function generateRandomNickname() {
        const adjectives = ["台北",
    "101",
    "北投",
    "城市",
    "北市",
    "信義",
    "北投",
    "士林",
    "中山",
    "北車",
    "松山",
    "貓空",
    "陽明",
    "大稻埕",
    "天母",
    "貓纜",
    "西門",
    "北城",
    "北捷",
    "忠孝路",
    "內湖",
    "萬隆",
    "東區",
    "大安公園",
    "城市",
    "忠孝東路",
    "中正"];
        const nouns = ["之光",
    "小太陽",
    "小天使",
    "探索者",
    "飛鷹",
    "夢想家",
    "暖心人",
    "夜行者",
    "智者",
    "追夢人",
    "飛鳥",
    "旅人",
    "山行者",
    "新星",
    "茶人",
    "文青",
    "心跳",
    "小精靈",
    "旅行家",
    "潛行者",
    "流浪者",
    "小俠",
    "先鋒",
    "勇者",
    "夜影",
    "詩人",
    "路旅者",
    "陽光",
    "小鹿",
    "夢想者",
    "藝人",
    "星辰",
    "潮人",
    "騎士",
    "小仙女",
    "小虎",
    "風箏",
    "微笑",
    "浪子",
    "街舞者",
    "霓虹",
    "陽光使者",
    "小太陽",
    "星光",
    "築夢人",
    "漫步者",
    "火焰",
    "追風"];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${randomAdjective}${randomNoun}`;
      }
  
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
        if (newMessage.value.trim()) {
          push(roomRef, {
            userName: userName.value,
            text: newMessage.value.trim(),
            timestamp: Date.now()
          }).then(() => {
            newMessage.value = '';
          }).catch((error) => {
            console.error('Error sending message:', error); 
          });
        }
      };
  
      return {
        roomName,
        messages,
        newMessage,
        sendMessage,
        messagesContainer,
        goBack,
        showBusInfo,
      };
    }
  }
  </script>
  
  <style scoped>
  .chat-room {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 20px;
    background-color: #f4f4f4;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  h2 {
    color: #4a4f52;
    margin: 0;
    text-align: center;
    flex-grow: 1;
  }
  
  .icon-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #36a3b2;
  }
  
  .icon-button:hover {
    color: #4a4f52;
  }
  
  .messages {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
  }
  
  .message-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    max-width: 100%;
  }
  
  .message-content {
    padding: 10px 15px;
    background-color: #36a3b2;
    color: white;
    border-radius: 20px;
    max-width: 70%;
    word-wrap: break-word;
  }
  
  .user-message .message-content {
    background-color: #4a4f52;
    margin-left: auto;
    text-align: right;
  }
  
  .message-author {
    font-size: 12px;
    color: #888;
    margin-bottom: 5px;
  }
  
  .input-area {
    display: flex;
  }
  
  input {
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #36a3b2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
  }
  
  button:hover {
    background-color: #4a4f52;
  }
  
  @media (max-width: 768px) {
    .chat-room {
      padding: 10px;
    }
  
    .message-content {
      max-width: 100%;
    }
  
    input {
      font-size: 14px;
    }
  
    button {
      font-size: 14px;
    }
  }
  </style>