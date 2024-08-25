<template>
    <el-container class="flex-1">
        <el-header>
            <banner active-index="function"></banner>
        </el-header>
        <el-main>
            <el-empty v-if="functionsPage.List.length === 0"
                class="h-full"
                description="无 AI 能力">
                <el-button type="primary" @click="handleCreate">创建</el-button>
            </el-empty>
            <div v-else class="flex flex-row">
                <div>
                    <div v-for="f in functionsPage.List">
                        <el-button
                            size="large"
                            :key="f.id"
                            :bg="f.id === editableFunction.id"
                            @click="handleSelect(f.id)"
                            text >
                            {{ f.template_name }}
                        </el-button>
                        <el-button v-if="f.id === editableFunction.id"
                            :icon="Delete"
                            @click="handleDelete(f.id)"
                            circle>
                        </el-button>
                    </div>
                    <el-button type="primary" @click="handleCreate">新建</el-button>
                </div>
                <el-form class="flex-1" :model="editableFunction" label-width="auto" label-position="top" :rules="rules"
                    ref="formRef">
                    <el-form-item label="能力名称" prop="templateName">
                        <el-input v-model="editableFunction.template_name" />
                    </el-form-item>
                    <el-form-item label="Prompt" prop="template">
                        <el-input v-model="editableFunction.template"
                            :autosize="{ minRows: 4, maxRows: 20 }"
                            type="textarea" />
                    </el-form-item>
                    <el-alert type="info" show-icon :closable="false">
                        <p>占位符是固定的字符串，在 prompt 里面固定作为槽位，服务端进行推理时会动态替换成对应内容，用户可以动态修改占位符位置，但不能随意修改格式</p>
                    </el-alert>
                    <el-form-item label="Prompt 占位符">
                        <el-button @click="handleAddSlot('context')">文档内容</el-button>
                        <el-button @click="handleAddSlot('law')">参考法律</el-button>
                        <el-button @click="handleAddSlot('role')">利益方</el-button>
                    </el-form-item>
                    <el-form-item label="模型名称" prop="modelName">
                        <el-select
                            v-model="editableFunction.model_name"
                            filterable
                            remote
                            reserve-keyword
                            placeholder="模型由服务技术人员在后台管理和维护"
                            remote-show-suffix
                            :remote-method="listModels"
                            :loading="loading"
                        >
                            <el-option v-for="item in options" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="知识库匹配阈值" prop="score_threshold">
                        <el-input-number v-model="editableFunction.score_threshold"
                            :precision="2"
                            :step="0.01"
                            :min="0" :max="1"/>
                    </el-form-item>
                    <el-form-item label="知识匹配条数" prop="top_k">
                        <el-input-number v-model="editableFunction.top_k" :min="0" :max="50"/>
                    </el-form-item>
                    <el-form-item label="模型采样温度" prop="temperature">
                        <el-input-number v-model="editableFunction.temperature"
                            :precision="2"
                            :step="0.01"
                            :min="0" :max="1"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="success" :loading="loading" @click="submitForm">保存</el-button>
                    </el-form-item>
                </el-form>
                <div class="flex-1 pl-3 flex flex-col">
                    <el-skeleton
                        class="flex-1"
                        v-if="loading === true && message.response === ''"
                        :rows="3" animated />
                    <el-text
                        v-else
                        class="flex-1"
                        line-clamp="100">
                        <div v-html="response"/>
                    </el-text>
                    <el-form-item label="测试项目">
                        <el-select
                            v-model="promptForm.book_identify"
                            filterable
                            remote
                            reserve-keyword
                            placeholder="选择测试知识库"
                            remote-show-suffix
                            :remote-method="listProjects"
                            :loading="loading"
                        >
                            <el-option v-for="item in projects" :key="item" :label="item.book_name" :value="item.identify" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="测试文档">
                        <el-select
                            v-model="promptForm.doc_id"
                            filterable
                            remote
                            reserve-keyword
                            placeholder="选择测试文档"
                            remote-show-suffix
                            :remote-method="listDocuments"
                            :loading="loading"
                        >
                            <el-option v-for="item in documents" :key="item.id" :label="item.identify" :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        v-if="editableFunction.template && editableFunction.template.includes('{{ role }}')"
                        label="利益方">
                        <el-input v-model="promptForm.role" placeholder="ex. 甲方，张三" :disabled="loading" />
                    </el-form-item>
                    <el-form-item
                        v-if="editableFunction.template && editableFunction.template.includes('{{ law }}')"
                        label="参考法律">
                        <el-input v-model="promptForm.law" placeholder="ex. 公司法" :disabled="loading" />
                    </el-form-item>
                    <el-button
                        class="mt-3"
                        :loading="loading"
                        :disabled="loading"
                        @click="testPrompt"
                        type="primary">
                        测试
                    </el-button>
                </div>
            </div>
        </el-main>
    </el-container>
</template>
<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import Banner from '../Home/components/Banner.vue';
import {
  Delete,
} from '@element-plus/icons-vue'

const functionsPage = ref({
    List: []
})
const loading = ref(false)
const projects = ref([])
const editableFunction = ref({})
const options = ref([])
const message = ref({
    response: ""
})
const response = ref(marked(message.value.response))
const documents = ref([])
const promptForm = reactive({
    book_identify: '',
    doc_id: '',
    role: '',
    law: '',
    function_id: '',
})

onMounted(async () => {
    const response = await axios.get("/api/ai/function")
    if (response.data.errcode !== 0) {
        ElMessage.warning(response.data.message)
    } else {
        functionsPage.value = response.data.data.page
        if (functionsPage.value.List.length > 0) {
            editableFunction.value = functionsPage.value.List[0]
        }
    }
    console.log(functionsPage.value)
})

// 表单提交相关逻辑
const listModels = async () => {
    loading.value = true
    const response = await axios.get('/api/ai/model')
    if (response.data.errcode !== 0) {
        ElMessage.warning(response.data.message)
    } else {
        options.value = response.data.data
    }
    loading.value = false
}
const rules = reactive({
    template_name: [
        { required: true, message: '请输入能力名称', trigger: 'blur' },
        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
    ],
    template: [
        { required: true, message: '请输入Prompt', trigger: 'blur' },
        { min: 1, max: 2048, message: '长度在 1 到 2048 个字符', trigger: 'blur' }
    ],
    model_name: [
        { required: true, message: '请选择模型', trigger: 'blur' },
    ],
    score_threshold: [
        { required: true, message: '请设置知识库匹配相关度阈值', trigger: 'blur' },
    ],
    top_k: [
        { required: true, message: '请设置匹配知识数', trigger: 'blur' },
    ],
    temperature: [
        { required: true, message: '请输入 LLM 采样温度', trigger: 'blur' },
    ],
})
const formRef = ref(null)
const submitForm = async () => {
    try {
        await formRef.value.validate(async (valid) => {
            if (valid) {
                const response = await axios.put(`/api/ai/function/${editableFunction.value.id}`, editableFunction.value)
                const { errcode, message } = response.data
                if (errcode === 0) {
                    ElMessage.success(message)
                    // 可以添加其他操作，比如显示提示信息等  
                } else {
                    // 表单提交失败，处理错误
                    ElMessage.warning(message)
                }
            } else {
                console.log('表单验证失败!');
                return false;
            }
        });
    } catch (error) {
        console.error(error);
    }
}

const handleSelect = async (id) => {
    functionsPage.value.List.forEach((item, index) => {
        if (item.id === id) {
            editableFunction.value = item
        }
    })
}
const handleDelete = async (id) => {
    const functions = functionsPage.value.List
    let active = editableFunction.value
    const response = await axios.delete(`/api/ai/function/${id}`)
    const { errcode, message } = response.data
    if (errcode === 0) {
        functions.forEach((item, index) => {
            if (item.id === id) {
                const nextFunction = functions[index + 1] || functions[index - 1]
                if (nextFunction) {
                    editableFunction.value = nextFunction
                }
            }
        })
        functionsPage.value.List = functions.filter((item) => item.id !== id)
    } else {
        // 表单提交失败，处理错误
        ElMessage.warning(message)
    }
}
const handleCreate = async () => {
    let response = await axios.get('/api/ai/model')
    if (response.data.errcode !== 0) {
        ElMessage.warning(response.data.message)
        return
    }
    if (response.data.data.length === 0) {
        ElMessage.warning("无可用的 AI 模型，请联系技术人员")
        return
    }
    const f = {
        template_name: "自定义能力",
        template: "帮我总结这个文档",
        model_name: response.data.data[0],
        score_threshold: 1.0,
        top_k: 3,
        temperature: 0.1,
    }
    response = await axios.post('/api/ai/function', f)
    const { errcode, message } = response.data
    if (errcode === 0) {
        functionsPage.value.List.push(response.data.data)
        editableFunction.value = response.data.data
        editableFunction.value.template_name += editableFunction.value.id
        await axios.put(`/api/ai/function/${editableFunction.value.id}`, f)
    } else {
        // 表单提交失败，处理错误
        ElMessage.warning(message)
    }
}
const handleAddSlot = async (slot) => {
    prompt = ''
    if (slot === 'context') {
        prompt = `\n<合同内容>{{ ${slot} }}</合同内容>`
    }
    if (slot === 'law') {
        prompt = `\n<法律条款>{{ ${slot} }}</法律条款>`
    }
    if (slot === 'role') {
        prompt = `\n你目前代表的是股东 {{ ${slot} }} 这一方, 因此你的回答和立场都要从你代表的这一方出发.`
    }
    editableFunction.value.template += prompt
}

watch(
    () => message.value.response,
    async (newValue, oldValue) => {
        response.value = marked(message.value.response);
    }
);
const listProjects = async () => {
    loading.value = true
    const response = await axios.get('/api/book/home');
    if (response.data.errcode !== 0) {
        ElMessage.warning(response.data.message)
    } else {
        projects.value = response.data.data;
    }
    loading.value = false
}
const listDocuments = async () => {
    loading.value = true
    console.log(promptForm)
    if (promptForm.book_identify === '') {
        return
    }
    const bookResponse = await axios.get(`/api/book/${promptForm.book_identify}`)
    if (bookResponse.data.errcode !== 0) {
        ElMessage.warning(bookResponse.data.message)
    } else {
        documents.value = bookResponse.data.data.document_trees
    }
    console.log(documents.value)
    loading.value = false
}

const testPrompt = async () => {
    await submitForm()
    if (!('EventSource' in window)) {
        ElMessage.warning('您的浏览器不支持该功能')
        return
    }
    loading.value = true
    promptForm.function_id = editableFunction.value.id
    const filteredParams = Object.fromEntries(
        Object.entries(promptForm).filter(([_, v]) => v != null && v !== '')
    )
    console.log(promptForm)
    const queryString = new URLSearchParams(filteredParams).toString()
    const url = `/aigc/customize_chat?${queryString}`
    const eventSource = new EventSource(url)
    eventSource.onmessage = (event) => {
        message.value.response += event.data
    }
    eventSource.addEventListener('start', async (event) => {
        const data = JSON.parse(event.data)
        message.value = data
    })
    eventSource.addEventListener('warning', (event) => {
        ElMessage.warning(event.data)
        console.log(event.data)
    })
    eventSource.addEventListener('close', (event) => {
        ElMessage.warning(event.data)
        console.log(event.data)
        message.value.approved = 1
    })
    eventSource.onerror = (event) => {
        eventSource.close()
        loading.value = false
    }
}
</script>

<style>
</style>
  