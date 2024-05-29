<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px" label-position="top" :rules="rules" ref="ruleFormRef">
        <el-form-item label="原始密码" prop="originSecret">
            <el-input v-model="form.originSecret" />
        </el-form-item>

        <el-form-item label="新密码" prop="newSecret">
            <el-input v-model="form.newSecret" />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmNewSecret">
            <el-input v-model="form.confirmNewSecret" />
        </el-form-item>

        <el-form-item>
            <el-button type="success" @click="submitForm(ruleFormRef)">保存</el-button>
        </el-form-item>
    </el-form>
</template>
<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
const props = defineProps(['dialogHiddenHandle'])

const form = reactive({
    originSecret: '',
    newSecret: '',
    confirmNewSecret: '',
})

const rules = ref({
    originSecret: [
        { required: true, message: '请输入原始密码', trigger: 'blur' },
    ],
    newSecret: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
    ],
    confirmNewSecret: [  
        { required: true, message: '请确认新密码', trigger: 'blur' },  
        { validator: checkConfirm, trigger: 'blur' } // 添加密码确认校验  
    ],
});

// 新增的密码确认校验函数  
function checkConfirm(rule, value, callback) {  
    if (value === '') {  
        callback(new Error('请确认新密码'));  
    } else if (value !== form.newSecret) {  
        callback(new Error('两次输入的新密码不一致'));  
    } else {  
        callback();  
    }  
}  
  
const ruleFormRef = ref(null) // 添加对表单的引用  
  
const submitForm = async () => {  
    try {  
        await ruleFormRef.value.validate(async valid => { // 使用validate方法进行表单校验  
            if (valid) {  
                console.log('submit!')  
                let response = await axios.post(`/api/xxx`, { form });  
                const { code, msg } = response;  
                if (code === 0) {  
                    // 成功-隐藏dialog，这里可以调用props中的dialogHiddenHandle方法  
                    props.dialogHiddenHandle();  
                } else {  
                    // 失败-toast提示，这里可以使用Element UI的Message组件或者其他提示方式  
                    this.$message.error(msg);  
                }  
            } else {  
                console.log('error submit!!');  
                return false;  
            }  
        });  
    } catch (error) {  
        // TODO  
    }  
}
</script>

