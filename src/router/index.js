import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import home01 from '../components/Home.vue'
import ChatRoom from '../views/ChatRoom.vue'
import businfo from '../components/businfo.vue'
import Script from '../views/Script.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/chatroom/:roomName',
      name: 'chatroom',
      component: ChatRoom
    },
    {
      path: '/',
      component: home01
    },
    {
      path: '/businfo/:roomName',
      name: 'BusInfo',
      component: businfo
    },
    {
      path: '/script',
      component: Script
    }

  ]
})

export default router
