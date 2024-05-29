<template>
    <el-form :model="loginForm" ref="ruleFormRef" :rules="loginRules" label-width="0px">
        <div style="display: flex;justify-content: center;width: 100%;align-items: center;font-size: 20px; margin-bottom: 10px;">
            登录</div>
        <el-form-item label="" prop="account">
            <el-input v-model="loginForm.account" placeholder="邮箱/用户名">
                <template #prepend>
                    <el-icon>
                        <UserFilled />
                    </el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="密码">
                <template #prepend>
                    <el-icon>
                        <Lock />
                    </el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="code">
            <el-input v-model="loginForm.code" placeholder="验证码">
                <template #prepend>
                    <el-icon>
                        <Check />
                    </el-icon>
                </template>
                <template #append>
                    <el-image :src="captchaUrl" @click="refreshCaptcha" class="self-stretch" fit="fill" />
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="" prop="keepLogin">
            <div style="display: flex;justify-content: space-between;width: 100%;align-items: center;">
                <el-checkbox v-model="loginForm.keepLogin" label="保持登录" size="large" />
                <span style="color: blue;cursor: pointer;" @click="props.setFindSecretStatus">忘记密码</span>
            </div>
        </el-form-item>
        <el-form-item>
            <el-button style="width: 100%" type="success" @click="handleLogin">登录</el-button>
        </el-form-item>
        <div style="font-size: 13px">
            <el-text>还没有账号？</el-text>
            <router-link style="text-decoration: none; color: inherit;" to="/register">
                <el-text style="color: blue; cursor: pointer;">立即注册</el-text>
            </router-link>
        </div>
    </el-form>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter();

const props = defineProps(['setFindSecretStatus'])
const loginForm = ref({
    account: '',
    password: '',
    code: '',
    keepLogin: false
});

const loginRules = {  
  account: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],  
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],  
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]  
};  

const captchaUrl = ref('/captcha')

const refreshCaptcha = () => {
    const time = new Date().getTime()
    captchaUrl.value = `/captcha?key=login&t=${time}`
};

const ruleFormRef = ref(null);

function handleLogin() {  
    ruleFormRef.value.validate((valid) => {  
        if (valid) {
            const formData = new FormData()
            formData.append('account', loginForm.value.account);
            formData.append('password', loginForm.value.password);
            formData.append('code', loginForm.value.code);
            if (loginForm.value.keepLogin) {
                formData.append('is_remember', 'yes');
            }
            axios.post('/auth/login', formData)
                .then(response => {
                    if (response.data.errcode == 0) {
                        ElMessage.success('登录成功');
                        // 重置表单
                        loginForm.value.username = '';
                        loginForm.value.password = '';
                        loginForm.value.code = '';
                        refreshCaptcha()
                        router.push('/');
                    } else {
                        ElMessage.error('登录失败: ' + response.data.message);
                    }
                })
                .catch(error => {
                    console.error('请求失败:', error);
                    ElMessage.error('请求失败，请稍后再试');
                });
        } else {
            // 校验失败，提示用户  
            ElMessage.error('表单校验失败，请检查');
        }
    })
}
</script>