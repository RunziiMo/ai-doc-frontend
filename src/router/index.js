import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import App from '../App.vue'

import Home from '../pages/Home/Home.vue';
import BookReader from '../pages/BookReader/BookReader.vue';
import Myspace from '../pages/Myspace/index.vue';
import Login from '../pages/Login/index.vue';
import Register from '../pages/Login/components/RegisterPage.vue';

const routes = [  
    // { path: '/docs/:identify', component: App }  
    { path: '/', component: Home, name: 'Home' },
    { path: '/docs/:identify', component: BookReader, name: 'BookReader' },
    { path: '/myspace', component: Myspace, name: 'Myspace' },
    { path: '/login', component: Login, name: 'Login' },
    { path: '/register', component: Register, name: 'Register' }
]

const router = createRouter({
    history: createWebHistory(),  
    routes // short for `routes: routes`  
})

const isLoggedIn = async () => {
    const response = await axios.post('/auth/login', new FormData())
    return response.data.errcode == 0
}

router.beforeEach(async (to, from) => {
    const loggedIn = await isLoggedIn()
    if (loggedIn && to.name === 'Register') {
        return { name: 'Home' }
    }
    if (loggedIn && to.name === 'Login') {
        return { name: 'Home' }
    }
    if (!loggedIn && to.name !== 'Login' && to.name !== 'Register') {
        // 没有登录进入登录页
        return { name: 'Login' }
    }
})

export default router