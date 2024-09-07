<template>
    <div class="chat-room">
      <div class="header">
        <button @click="goBack" class="icon-button">
          <img src="/src/assets/back.png" alt="返回">
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
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="輸入訊息..." :disabled="isSending" />
        <button @click="sendMessage" class="send" :disabled="isSending">送出</button>
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
      const isSending = ref(false);
  
      const goBack = () => {
        router.push('/');
      };
  
      const showBusInfo = () => {
        console.log('顯示公車資訊');
        router.push(`/businfo/${roomName.value}`);
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

    onUnmounted(() => {
      off(roomRef);
    });

    const sendMessage = () => {
      if (newMessage.value.trim() && !isSending.value) {
        isSending.value = true;
        push(roomRef, {
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

    return {
      roomName,
      messages,
      newMessage,
      sendMessage,
      messagesContainer,
      goBack,
      showBusInfo,
      isSending,
      userName
    };
  }
}
</script>

<style scoped>
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

.message-content {
  padding: 10px 15px;
  background-color: #36a4b285;
  color: white;
  border-radius: 20px;
  word-wrap: break-word;
  display: inline-block;
  max-width: 100%;
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