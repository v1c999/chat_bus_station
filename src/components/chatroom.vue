<template>
    <div id="app">
      <h1>Chat Room</h1>
      <div class="chat">
        <div v-for="(msg, index) in messages" :key="index">
          {{ msg }}
        </div>
      </div>
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type a message..." />
      <button @click="sendMessage">Send</button>
    </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  
  export default {
    data() {
      return {
        socket: null,
        message: '',
        messages: [],
      };
    },
    mounted() {
      // Connect to WebSocket server
      this.socket = io('http://localhost:3000');
  
      // Listen for messages from server
      this.socket.on('message', (msg) => {
        this.messages.push(msg);
      });
    },
    methods: {
      sendMessage() {
        if (this.message.trim()) {
          // Send message to server
          this.socket.emit('message', this.message);
          this.message = ''; // Clear input
        }
      },
    },
  };
  </script>
  
  <style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    margin-top: 50px;
  }
  .chat {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 300px;
    overflow-y: scroll;
    background-color: #f9f9f9;
  }
  input {
    width: 80%;
    padding: 10px;
    font-size: 1rem;
  }
  button {
    padding: 10px;
    font-size: 1rem;
  }
  </style>
  