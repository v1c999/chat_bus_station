<template>
    <div class="chat-room">
      <h2>{{ roomName }} 聊天室</h2>
      <div class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" class="message">
          <strong>{{ message.userName }}:</strong> {{ message.text }}
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
  import { useRoute } from 'vue-router';
  import { getDatabase, ref as dbRef, push, onChildAdded, off } from 'firebase/database';
  import { getAuth, onAuthStateChanged } from 'firebase/auth';
  
  export default {
    setup() {
      const route = useRoute();
      const roomName = ref(route.params.roomName);
      const messages = ref([]);
      const newMessage = ref('');
      const messagesContainer = ref(null);
      const db = getDatabase();
      const auth = getAuth();
      const user = ref(null);
  
      const roomRef = dbRef(db, `chatrooms/${roomName.value}`);
  
      onMounted(() => {
        onAuthStateChanged(auth, (currentUser) => {
          user.value = currentUser;
        });
  
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
        if (newMessage.value.trim() && user.value) {
          push(roomRef, {
            userName: user.value.displayName || user.value.email,
            text: newMessage.value.trim(),
            timestamp: Date.now()
          });
          newMessage.value = '';
        }
      };
  
      return {
        roomName,
        messages,
        newMessage,
        sendMessage,
        messagesContainer
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
  }
  
  .messages {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    padding: 10px;
  }
  
  .message {
    margin-bottom: 10px;
  }
  
  .input-area {
    display: flex;
  }
  
  input {
    flex-grow: 1;
    padding: 10px;
    font-size: 16px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  </style>