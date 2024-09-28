<template>  
    <el-form :model="forgotForm" ref="forgotFormRef" :rules="rules" label-width="0px">  
        <div style="display: flex;justify-content: center;width: 100%;align-items: center;font-size: 20px; margin-bottom: 10px;">  
            找回密码</div>  
        <el-form-item label="" prop="email" :rules="{ required: true, message: '请输入邮箱/用户名', trigger: 'blur' }">  
            <el-input v-model="forgotForm.email" placeholder="邮箱/用户名">  
                <template #prepend>
                    <el-icon>
                        <Message />
                    </el-icon>
                </template>  
            </el-input>  
        </el-form-item>  
        <el-form-item label="" prop="captcha" :rules="{ required: true, message: '请输入验证码', trigger: 'blur' }">  
            <el-input v-model="forgotForm.captcha" placeholder="验证码">  
                <template #prepend>  
                    <el-icon>
                        <Check />
                    </el-icon>
                </template>
                <template #append>
                    <el-image :src="captchaUrl" @click="refreshCaptcha" class="self-stretch" fit="fill" />
                </template>
            </el-input>
            <el-button type="text" @click="refreshCaptcha">刷新</el-button>  
        </el-form-item>  
        <el-form-item>  
            <el-button type="success" style="width: 100%" @click="handleForgotPassword">找回密码</el-button>  
        </el-form-item>  
    </el-form>  
</template>  
  
<script setup>  
import { ref } from 'vue';  
import axios from 'axios'

const forgotForm = ref({  
    email: '',  
    captcha: '',  
});  
  
const forgotFormRef = ref(null);
const rules = {  
    email: [  
        { required: true, message: '请输入邮箱/用户名', trigger: 'blur' },  
        // 可以添加更多的校验规则，比如邮箱格式校验等  
    ],  
    captcha: [  
        { required: true, message: '请输入验证码', trigger: 'blur' },  
        // 可以添加验证码长度、格式等校验规则  
    ],  
};  


const captchaUrl = ref('/captcha')
const refreshCaptcha = async () => {
    const time = new Date().getTime()
    captchaUrl.value = `/captcha?key=login&t=${time}`
};  
  
const handleForgotPassword = async () => {  
    // 触发表单的验证
    if (forgotFormRef.value.validate(async (valid) => {  
        if (valid) {
            const formData = new FormData();
            formData.append('email', forgotForm.value.email);
            formData.append('code', forgotForm.value.captcha);
            const response = await axios.post('/find_password', formData);
            const data = response.data;
            console.log(forgotForm.value)
            if (data.errcode !== 0) {
                ElMessage({
                    message: data.message,
                    type: 'warning',
                });
            } else {
                // 如果验证通过，执行重置密码逻辑  
                // ...  
                ElMessage({
                    message: "密码重置请求已发送，请检查您的邮箱。",
                    type: 'success',
                });
            }
        } else {  
            // 如果验证不通过，则提示错误信息  
            return false;  
        }  
    })) {  
        // 这里不会执行，因为validate方法是异步的，且没有返回值  
    }  
};  
</script>