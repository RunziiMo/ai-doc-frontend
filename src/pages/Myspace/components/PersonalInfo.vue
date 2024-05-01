<template>
    <div>
        <el-form :model="form" label-width="auto" style="max-width: 600px" label-position="top" :rules="rules"
            ref="formRef">
            <el-form-item label="用户名" prop="userName">
                <el-input v-model="form.userName" />
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="form.realName" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号" prop="phoneNumber">
                <el-input v-model="form.phoneNumber" />
            </el-form-item>
            <el-form-item label="描述" prop="desc">
                <el-input v-model="form.desc" />
            </el-form-item>
            <el-form-item label="" prop="desc">
                <el-button type="success" @click="submitForm">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
const props = defineProps(['dialogHiddenHandle'])
// dialogHiddenHandle

const form = reactive({
    userName: '',
    realName: '',
    email: '',
    desc: '',
    phoneNumber: '',
})

const rules = reactive({
    userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' },
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
    ],
    phoneNumber: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
    ],
    desc: [
        // 如果需要可以为描述字段添加验证规则  
    ],
})

const formRef = ref(null)

const dialogHiddenHandle = () => {
    // 这里实现隐藏对话框的逻辑，可能涉及到调用父组件的方法或改变某个prop的值  
    // 假设你有一个名为showDialog的prop来控制对话框的显示与隐藏  
    // emit('update:showDialog', false)
}

const submitForm = async () => {
    try {
        await formRef.value.validate((valid) => {
            if (valid) {
                axios.post('/api/xxx', form)
                    .then(response => {
                        const { code, msg } = response.data;
                        if (code === 0) {
                            dialogHiddenHandle();
                            // 可以添加其他操作，比如显示提示信息等  
                        } else {
                            // 表单提交失败，处理错误  
                            alert(msg);
                        }
                    })
                    .catch(error => {
                        // 请求失败，处理错误  
                        console.error(error);
                    });
            } else {
                console.log('表单验证失败!');
                return false;
            }
        });
    } catch (error) {
        console.error(error);
    }
}  
</script>
