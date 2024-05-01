<template>
    <el-form :model="registerForm" ref="registerFormRef" :rules="rules" label-width="0px">
        <div
            style="display: flex;justify-content: center;width: 100%;align-items: center;font-size: 20px; margin-bottom: 10px;">
            注册</div>
        <el-form-item label="" prop="username">
            <el-input v-model="registerForm.username" placeholder="用户名">
                <template #prepend>
                    <el-button icon="UserFilled" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
            <el-input type="password" v-model="registerForm.password"  placeholder="密码">
                <template #prepend>
                    <el-button icon="Lock" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
            <el-input type="password" v-model="registerForm.confirmPassword"  placeholder="确认密码">
                <template #prepend>
                    <el-button icon="Lock" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="email">
            <el-input v-model="registerForm.email"  placeholder="邮箱">
                <template #prepend>
                    <el-button icon="Message" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="captcha">
            <el-input v-model="registerForm.captcha" placeholder="验证码">
                <template #prepend>
                    <el-button icon="Check" />
                </template>
            </el-input>
            <!-- <img src="captcha-url" @click="refreshCaptcha" alt="验证码" />   -->
        </el-form-item>
        <el-form-item>
            <el-button type="success" style="width: 100%" @click="handleRegister">立即注册</el-button>
        </el-form-item>
        <div style="font-size: 13px">
            <span>已有账号? </span>
            <span style="color: blue; cursor: pointer;" @click="props.setLoginStatus">登录</span>
        </div>
    </el-form>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['setLoginStatus'])
const registerFormRef = ref('')
const registerForm = ref({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    captcha: '',
});

const rules = {  
    username: [  
        { required: true, message: '请输入用户名', trigger: 'blur' },  
        // 可以添加其他校验规则，比如用户名长度限制等  
    ],  
    password: [  
        { required: true, message: '请输入密码', trigger: 'blur' },  
        { min: 6, max: 16, message: '密码长度在 6 到 16 个字符', trigger: 'blur' }  
    ],  
    confirmPassword: [  
        { required: true, message: '请确认密码', trigger: 'blur' },  
        { min: 6, max: 16, message: '密码长度在 6 到 16 个字符', trigger: 'blur' }
    ],
    email: [  
        { required: true, message: '请输入邮箱/用户名', trigger: 'blur' },  
        // 可以添加更多的校验规则，比如邮箱格式校验等  
    ],  
    captcha: [  
        { required: true, message: '请输入验证码', trigger: 'blur' },  
        // 可以添加验证码长度、格式等校验规则  
    ],
}

const refreshCaptcha = () => {
    // 刷新验证码逻辑  
};

const handleRegister = () => {
    // 注册逻辑  
    registerFormRef.value.validate((valid) => {  
        if (valid) {  
            // 这里执行登录逻辑，例如发送登录请求到后端  
            // 假设登录成功，则触发 loginSuccess 事件  
            // emit('loginSuccess');  
        } else {  
            // 校验失败，提示用户  
            ElMessage.error('表单校验失败，请检查');
        }
    })
};

</script>