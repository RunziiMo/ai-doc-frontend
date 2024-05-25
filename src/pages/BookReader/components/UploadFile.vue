<template>
    <el-dialog v-model="dialogFormVisible" title="上传文档" style="width: 435px">
        <el-form :model="form" label-width="auto" style="max-width: 600px" label-position="top" :rules="rules">
            <!-- <el-form-item label="文档标识" prop="doc_name">
                <el-input v-model="form.doc_name" placeholder="文档名称，不超过100字"/>
            </el-form-item> -->
            <el-form-item label="" prop="file">
                <el-upload
                    v-model:file-list="form.file"
                    class="upload-file"
                    :action="`/api/${book.identify}/create`"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :before-remove="beforeRemove"
                    :limit="1"
                    :on-exceed="handleExceed"
                    :auto-upload="false"
                >
                    <el-input placeholder="请选择docx或者pdf文件" style="width: 400px">
                        <template #append>
                            <el-button type="primary">选择</el-button>
                        </template>
                    </el-input>
                    
                    <!-- <template #tip>
                    <div class="el-upload__tip">
                        jpg/png files with a size less than 500KB.
                    </div>
                    </template> -->
                </el-upload>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button @click="submitUpload" type="primary">上传</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const props = defineProps({
    dialogVisible: {
        type: Boolean,
        required: true,
    },
    book: {  
        type: Object,
        required: true,
    },
});

const form = reactive({
    file: '',
    doc_name: '',
    description: 'This is an example file upload', // 任何其他描述或信息  
})

const emit = defineEmits(['update:dialogVisible', 'success', 'error']);
const dialogFormVisible = computed({
    get() {
        return props.dialogVisible;  
    },
    set(newValue) {
        emit('update:dialogVisible', newValue);
    },
});

const submitUpload = () => {
    const formData = new FormData();
    formData.append('import-file', form.file[0].raw);
    
    let filename = form.file[0].name;
    if (filename.endsWith('.docx')) {  
        filename = filename.slice(0, -5);
    } else if (filename.endsWith('.pdf')) {
        filename = filename.slice(0, -4);
    } else {
        ElMessage.error('文件必须是docx或者pdf');
        emit('error');
        return;
    }
    formData.append('doc_name', filename);
    
    axios.post(`/api/${props.book.identify}/create`, formData)
        .then(response => {
            if (response.data.errcode == 0) {
                ElMessage.success('项目创建成功');
                // 重置表单
                form.itemId = 0;
                form.book_name = '';
                form.identify = '';
                form.description = '';
                form.privately_owned = 1;
                form.file = [];
                dialogFormVisible.value = false;
                emit('success');
            } else {
                ElMessage.error('项目创建失败: ' + response.data.message);
                emit('error');
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
            ElMessage.error('请求失败，请稍后再试');
            emit('error');
        });
}

function handlePreview() {}
function handleRemove() {}
function beforeRemove() {}
function handleExceed() {}
</script>