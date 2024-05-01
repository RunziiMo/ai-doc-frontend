<template>
    <el-form :model="loginForm" ref="ruleFormRef" :rules="loginRules" label-width="0px">
        <div
            style="display: flex;justify-content: center;width: 100%;align-items: center;font-size: 20px; margin-bottom: 10px;">
            登录</div>
        <el-form-item label="" prop="username">
            <el-input v-model="loginForm.username" placeholder="邮箱/用户名">
                <template #prepend>
                    <el-button icon="UserFilled" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="密码">
                <template #prepend>
                    <el-button icon="Lock" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="captcha">
            <el-input v-model="loginForm.captcha" placeholder="验证码">
                <template #prepend>
                    <el-button icon="Check" />
                </template>
            </el-input>
            <!-- <img src="captcha-url" @click="refreshCaptcha" alt="验证码" />   -->
        </el-form-item>
        <el-form-item>
            <div style="display: flex;justify-content: space-between;width: 100%;align-items: center;">
                <el-checkbox v-model="checked1" label="保持登录" size="large" />
                <span style="color: blue;cursor: pointer;" @click="props.setFindSecretStatus">忘记密码</span>
            </div>
        </el-form-item>
        <el-form-item>
            <el-button style="width: 100%" type="success" @click="handleLogin">登录</el-button>
        </el-form-item>
        <div style="font-size: 13px">
            <span>还没有账号? </span>
            <span style="color: blue; cursor: pointer;" @click="props.setRegisterStatus">立即注册</span>
        </div>
    </el-form>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
const props = defineProps(['setRegisterStatus', 'setFindSecretStatus'])
const loginForm = ref({
    username: '',  
    password: '',  
    captcha: '',  
    keepLogin: false 
});

const loginRules = {  
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],  
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],  
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]  
};  

const refreshCaptcha = () => {
    // 发送请求到后端刷新验证码  
    // 假设后端会返回新的验证码图片的URL  
    // 然后你可以更新 img 的 src 属性  
};

const ruleFormRef = ref(null);

function handleLogin() {  
    ruleFormRef.value.validate((valid) => {  
        if (valid) {  
            // 这里执行登录逻辑，例如发送登录请求到后端  
            // 假设登录成功，则触发 loginSuccess 事件  
            emit('loginSuccess');  
        } else {  
            // 校验失败，提示用户  
            ElMessage.error('表单校验失败，请检查');
        }
    })
}

const goRegister = () => {
    // 跳转到注册页面  
};

</script>