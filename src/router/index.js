import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

import Home from '../pages/Home/index.vue';
import Docs from '../pages/Docs/index.vue';
import Myspace from '../pages/Myspace/index.vue';
import Login from '../pages/Login/index.vue';

const routes = [  
  // { path: '/docs/:identify', component: App }  
  { path: '/', component: Home, name: 'Home' },
  { path: '/docs/:identify', component: Docs, name: 'Docs' },
  { path: '/myspace', component: Myspace, name: 'Myspace' },
  { path: '/login', component: Login, name: 'Login' }
]

const router = createRouter({
  history: createWebHistory(),  
  routes // short for `routes: routes`  
})

export default router