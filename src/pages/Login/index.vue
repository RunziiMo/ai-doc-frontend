<template>
    <div style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">  
        <div style="width: 300px; border: 1px solid #ccc; border-radius: 10px; padding: 20px;">  
        <login v-if="currentStatus === STATUS.LOGIN" :set-register-status="setRegisterStatus" :set-find-secret-status="setFindSecretStatus"></login>  
        <register v-if="currentStatus === STATUS.REGISTER" :set-login-status="setLoginStatus"></register>  
        <find-secret v-if="currentStatus === STATUS.FIND_SECRET" :set-login-status="setLoginStatus"></find-secret>  
        </div>  
    </div>
</template>
<script setup>

import { ref } from 'vue'
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import FindSecret from './components/FindSecret.vue';

// 定义枚举值  
const STATUS = {  
  LOGIN: 'login',  
  REGISTER: 'register',  
  FIND_SECRET: 'findSecret'  
};  
  
// 设置当前状态为登录状态作为默认  
const currentStatus = ref(STATUS.LOGIN);  
  
// 你可以添加方法来改变状态  
function setLoginStatus() {  
  currentStatus.value = STATUS.LOGIN;  
}  
  
function setRegisterStatus() {  
  currentStatus.value = STATUS.REGISTER;  
}  
  
function setFindSecretStatus() {  
  currentStatus.value = STATUS.FIND_SECRET;  
}
</script>

<style>

</style>
  