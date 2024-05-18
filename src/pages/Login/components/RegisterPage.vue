<template>
    <div style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">  
        <div style="width: 300px; border: 1px solid #ccc; border-radius: 10px; padding: 20px;">  
            <el-form :model="registerForm" ref="registerFormRef" :rules="rules" label-width="0px">
                <div
                    style="display: flex;justify-content: center;width: 100%;align-items: center;font-size: 20px; margin-bottom: 10px;">
                    注册</div>
                <el-form-item label="" prop="account">
                    <el-input v-model="registerForm.account" placeholder="用户名">
                        <template #prepend>
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" prop="password1">
                    <el-input type="password" v-model="registerForm.password1"  placeholder="密码">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" prop="password2">
                    <el-input type="password" v-model="registerForm.password2"  placeholder="确认密码">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" prop="email">
                    <el-input v-model="registerForm.email"  placeholder="邮箱">
                        <template #prepend>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="" prop="code">
                    <el-input v-model="registerForm.code" placeholder="验证码">
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
                <el-form-item>
                    <el-button type="success" style="width: 100%" @click="handleRegister">立即注册</el-button>
                </el-form-item>
                <div>
                    <el-text>已有账号? </el-text>
                    <router-link style="text-decoration: none; color: inherit;" to="/login">
                        <el-text style="color: blue; cursor: pointer;">登录</el-text>
                    </router-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter();

const registerFormRef = ref('')
const registerForm = ref({
    account: '',
    password1: '',
    password2: '',
    email: '',
    code: '',
});

const rules = {  
    account: [  
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
    code: [  
        { required: true, message: '请输入验证码', trigger: 'blur' },  
        // 可以添加验证码长度、格式等校验规则  
    ],
}

const captchaUrl = ref('/captcha')

const refreshCaptcha = () => {
    const time = new Date().getTime()
    captchaUrl.value = `/captcha?key=register&t=${time}`
};

const handleRegister = () => {
    // 注册逻辑  
    registerFormRef.value.validate((valid) => {  
        if (valid) {  
            const formData = new FormData()
            formData.append('account', registerForm.value.account);
            formData.append('password1', registerForm.value.password1);
            formData.append('password2', registerForm.value.password2);
            formData.append('email', registerForm.value.email);
            formData.append('code', registerForm.value.code);
            axios.post('/auth/register', formData)
                .then(response => {
                    if (response.data.errcode == 0) {
                        ElMessage.success('注册成功');
                        // 重置表单
                        registerForm.value.code = '';
                        refreshCaptcha()
                        router.push('/');
                    } else {
                        ElMessage.error('注册失败: ' + response.data.message);
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
};

</script>