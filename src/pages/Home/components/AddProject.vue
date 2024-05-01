<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px" label-position="top" :rules="rules"
        ref="ruleFormRef">
        <el-form-item label="项目空间" prop="projectSpace">
            <el-input v-model="form.projectSpace" placeholder="每个项目必须归属一个项目空间，超级管理员可在后台管理和维护"/>
        </el-form-item>
        <el-form-item label="项目标题" prop="projectTitle">
            <el-input v-model="form.projectTitle" placeholder="项目标题，不超过100字"/>
        </el-form-item>
        <el-form-item label="项目标识" prop="projectFlag">
            <el-input v-model="form.projectFlag" placeholder="项目标识，不超过50字"/>
        </el-form-item>
        <el-form-item label="项目描述" prop="projectDesc">
            <el-input type="textarea" v-model="form.projectDesc" placeholder="项目描述，不超过500字"/>
        </el-form-item>
        <el-form-item label="">
            <el-radio-group v-model="form.projectSecret">
                <el-radio :value="1">公开(任何人都可以访问)</el-radio>
                <el-radio :value="0">私有(只有参与者或者使用令牌才能访问)</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="" prop="file">
            <el-upload  
                v-model:file-list="form.file"  
                class="upload-file"  
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"  
                :on-success="handleSuccess"  
                :auto-upload="false"
                :before-upload="beforeUpload"
                multiple  
                :on-preview="handlePreview"  
                :on-remove="handleRemove"  
                :before-remove="beforeRemove"  
                :limit="1"  
                :on-exceed="handleExceed"  
                >  
                <el-input placeholder="请选择Zip或者Docx文件" style="width: 540px"></el-input>  
                <el-button type="primary">选择</el-button>  
            </el-upload>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">
                创建
            </el-button>
            <el-button @click="props.dialogHiddenHandle">取消</el-button>
        </el-form-item>
    </el-form>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
const props = defineProps(['dialogHiddenHandle'])
// dialogHiddenHandle

// 表单数据  
const form = reactive({
    projectSpace: '',
    projectTitle: '',
    projectFlag: '',
    projectDesc: '',
    projectSecret: 1, // 假设公开为默认值  
    file: [] // 文件列表  
});

const rules = {
    projectSpace: [
        { required: true, message: '请输入项目空间', trigger: 'blur' },
        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    projectTitle: [
        { required: true, message: '请输入项目标题', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
    ],
    projectFlag: [
        { required: true, message: '请输入项目标识', trigger: 'blur' },
        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    projectDesc: [
        { required: true, message: '请输入项目描述', trigger: 'blur' },
        { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
    ],
    file: [
        {
            required: true,
            message: '请选择一个文件上传',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (value.length > 0) {
                    const file = value[0].raw; // 获取第一个文件对象  
                    const fileType = file.type;
                    const acceptTypes = ['application/zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                    if (acceptTypes.indexOf(fileType) === -1) {
                        return callback(new Error('文件类型必须是 ZIP 或 DOCX'));
                    }
                    // 还可以添加其他文件属性检查，比如大小限制等  
                    callback();
                } else {
                    callback(new Error('请选择一个文件上传'));
                }
            },
            trigger: 'change',
        },
    ],
};

// 表单引用，用于表单校验  
const ruleFormRef = ref(null);

const beforeUpload = file => {
    // 处理文件上传的逻辑
}

// 提交表单  
function submitForm() {
    ruleFormRef.value.validate((valid) => {
        if (valid) {
            // 表单校验通过，开始提交表单数据  
            console.log('提交数据', form);
            axios.post('/api/createProject', form) // 替换为实际的API地址  
                .then(response => {
                    if (response.data.success) {
                        ElMessage.success('项目创建成功');
                        // 重置表单  
                        form.projectSpace = '';
                        form.projectTitle = '';
                        form.projectFlag = '';
                        form.projectDesc = '';
                        form.projectSecret = 1;
                        form.file = [];
                    } else {
                        ElMessage.error('项目创建失败: ' + response.data.message);
                    }
                })
                .catch(error => {
                    console.error('请求失败:', error);
                    ElMessage.error('请求失败，请稍后再试');
                });
        } else {
            // 表单校验不通过，提示用户错误信息  
            return false;
        }
    });
}

// 假设的文件上传前的处理逻辑  
function beforeRemove(file, fileList) {
    return this.$confirm(`确定移除 ${file.name}？`);
}

// 处理文件超出限制的情况  
function handleExceed(files, fileList) {
    this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
}

// 处理文件预览  
function handlePreview(file) {
    console.log(file);
}

// 处理文件移除  
function handleRemove(file, fileList) {
    console.log(file, fileList);
}

// 初始化数据，如果需要从后端获取初始数据，可以在这里使用axios请求  
onMounted(async () => {
    // 假设我们从后端获取了一些初始数据，这里用模拟数据代替  
    const mockData = {
        // 这里是假设从后端获取的初始数据格式  
        // 根据实际情况调整  
    };

    // 将获取的数据设置到表单中  
    // Object.assign(form, mockData);  
});  
</script>
