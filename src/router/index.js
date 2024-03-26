import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const routes = [  
  { path: '/docs/:identify', component: App }  
]

const router = createRouter({
  history: createWebHistory(),  
  routes // short for `routes: routes`  
})

export default router