<template>
  <div class="chat-room">
    <h2>{{ station.name }} 聊天室</h2>
    <div class="messages">
      <div v-for="message in messages" :key="message.id">
        <strong>{{ message.user }}:</strong> {{ message.text }}
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="輸入訊息..." />
      <button @click="sendMessage">發送</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { push, onChildAdded, ref as dbRef, off } from 'firebase/database'

export default {
  props: ['station'],
  setup(props) {
    const messages = ref([])
    const newMessage = ref('')
    const db = inject('$db')

    const messagesRef = dbRef(db, `chats/${props.station.id}/messages`)

    onMounted(() => {
      onChildAdded(messagesRef, (snapshot) => {
        messages.value.push(snapshot.val())
      })
    })

    onUnmounted(() => {
      off(messagesRef)
    })

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        push(messagesRef, {
          user: 'Anonymous', 
          text: newMessage.value
        })
        newMessage.value = ''
      }
    }

    return {
      messages,
      newMessage,
      sendMessage
    }
  }
}
</script>