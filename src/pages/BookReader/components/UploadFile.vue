<template>
    <el-dialog v-model="dialogFormVisible" title="上传文档" style="width: 435px">
        <el-form :model="form" label-width="auto" style="max-width: 600px" label-position="top" :rules="rules">
            <el-form-item label="" prop="file">
                <el-upload
                    v-model:file-list="form.file"
                    class="upload-file"
                    :action="`/api/${book.identify}/create`"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    :before-remove="beforeRemove"
                    :on-exceed="handleExceed"
                    :auto-upload="false"
                    multiple
                    accept=".docx,.pdf"
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
                <el-button @click="submitUpload" :loading="loading" type="primary">上传</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import axios from 'axios';
import { marked } from 'marked'
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
    file: [],
    description: 'This is an example file upload', // 任何其他描述或信息  
})
const rules = {
    file: [
        {
            required: true,
            message: '请选择一个文件上传',
            trigger: 'change'
        },
        {
            validator: (rule, value, callback) => {
                if (value.length > 0) {
                const file = value[0].raw // 获取第一个文件对象
                const fileType = file.type
                const acceptTypes = [
                    'application/zip',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/pdf'
                ]
                value.forEach(file => {
                    const raw = file.raw
                    const fileType = raw.type;
                    if (acceptTypes.indexOf(fileType) === -1) {
                    return callback(new Error('文件类型必须是 ZIP 或 DOCX 或 PDF'))
                    }
                });
                    // 还可以添加其他文件属性检查，比如大小限制等
                    callback()
                } else {
                    callback(new Error('请选择一个文件上传'))
                }
            },
            trigger: 'change'
        }
    ]
}

const emit = defineEmits(['update:dialogVisible', 'success', 'error']);
const dialogFormVisible = computed({
    get() {
        return props.dialogVisible;  
    },
    set(newValue) {
        emit('update:dialogVisible', newValue);
    },
});

const loading = ref(false);

const uploadFile = async (file) => {
    const formData = new FormData();
    const fileName = file.name;
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));

    formData.append('doc_identify', fileName);
    formData.append('doc_name', nameWithoutExtension);
    let response = await axios.post(`/api/${props.book.identify}/create`, formData)
    if (response.data.errcode !== 0) {
        ElMessage.error('文档创建失败: ' + response.data.message);
        loading.value = false;
        emit('error');
        return
    }
    
    const document = response.data.data;
    formData.append('import-file', file.raw);
    // TODO extract file to markdown
    const markdown = `# ${fileName}\nThis is a simple Markdown file saying ${fileName}.\n`;
    formData.append('markdown', markdown);
    formData.append('html', marked(markdown));
    response = await axios.post(`/api/${props.book.identify}/content/${document.doc_id}`, formData)
    if (response.data.errcode !== 0) {
        ElMessage.error('文档上传失败: ' + response.data.message);
        loading.value = false;
        emit('error');
        return
    }
}

const uploadFiles = async() => {
  const requests = [];
  form.file.forEach(async (file) => {
    requests.push(uploadFile(file))
  })

  await Promise.all(requests); 
}

const submitUpload = async () => {
    loading.value = true;
    await uploadFiles();
    ElMessage.success('文档创建成功');
    loading.value = false;
    dialogFormVisible.value = false;
    // 重置表单
    form.itemId = 0;
    form.book_name = '';
    form.identify = '';
    form.description = '';
    form.privately_owned = 1;
    form.file = [];
    emit('success');
}

function handlePreview() {}
function handleRemove() {}
function beforeRemove() {}
function handleExceed() {}
</script>