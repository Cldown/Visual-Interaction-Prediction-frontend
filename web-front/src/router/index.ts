// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import pageView from '@/views/pageView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: pageView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router