<template>
  <DocumentOperate
    v-model:entityRecognitionLoading="entityRecognitionLoading"
    v-model:entityList="entityList"
    @ai-pre-request="handleAiRequest"
    @anonymous-processing="docNameEntityRecognition"
  />
  <div
    class="flex-1 hide-scrobar flex flex-col items-stretch overflow-y-scroll mb-3"
    ref="scrollContainer"
    style="scrollbar-width: none; -ms-overflow-style: none"
  >
    <ChatMessage
      v-for="m in messages"
      :message="m"
      :export="exportMode"
      @text-selected="(text) => $emit('textSelected', text)"
      @deleted-message="handleDeleteMessage"
      @switch-export="(id) => switchExport(id)"
      @update-response-success="updateMessege"
    >
    </ChatMessage>
    <div ref="viewAnchor" />
  </div>
  <el-form v-if="!exportMode" label-position="right" label-width="auto">
    <el-form-item label="利益方">
      <el-input v-model="role" placeholder="ex. 甲方，张三" :disabled="entityRecognitionLoading" />
    </el-form-item>
  </el-form>
  <div v-if="!exportMode" class="self-stretch flex mb-3 justify-between">
    <el-autocomplete
      class="flex-1 inline-input"
      v-model="prompt"
      @select="customizeChat"
      :fetch-suggestions="querySearch"
      :highlight-first-item="true"
      :trigger-on-focus="false"
      :fit-input-width="true"
      clearable
      placeholder="输入 / 选择或者直接提问"
      :disabled="entityRecognitionLoading"
    >
      <template #default="{ item }">
        <div class="flex justify-between  ">
          <div class="flex flex-col">
            <el-text class="self-start">{{ item.template_name }}</el-text>
          </div>
          <el-text truncated>{{ item.template}}</el-text>
          <div class="flex items-center slef-end">
            <el-text>
              作者：{{ item.author }}
              <el-icon class="el-input__icon">
                <StarFilled />
              </el-icon>
              {{ item.agree_count }}
            </el-text>
          </div>
        </div>
      </template>
    </el-autocomplete>
    <el-button
      @click="docAnalyze(prompt)"
      :loading="loading"
      class="ml-3"
      type="success"
      :disabled="entityRecognitionLoading"
      :icon="Promotion"
    />
  </div>
  <div v-else class="self-stretch flex mb-3 justify-between items-center">
    <el-checkbox
      class="self-center"
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
    >
      全部选中
    </el-checkbox>
    <el-button @click="switchExport" class="w-30">取消</el-button>
    <el-button @click="showExportDialog = true" class="w-30" type="primary">导出</el-button>
  </div>
  <ExportDialog v-model:showDialog="showExportDialog" :document="document" :messages="messages" />
</template>

<script lang="ts" setup>
import { reactive, ref, computed, watch, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { isProxy, toRaw } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import { Edit } from '@element-plus/icons-vue'
import axios from 'axios'
import ExportDialog from './ExportDialog.vue'
import DocumentOperate from './DocumentOperate.vue'

const entityList = defineModel('entityList', {
  type: Array,
  default: []
})

const props = defineProps({
  bookIdentify: {
    type: String,
    required: true
  },
  document: {
    type: Object,
    required: true
  },
  functions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['textSelected', 'entityResults'])

let intervalId
onMounted(async () => {
  if (props.document.doc_id) {
    messages.value = await loadChatMessages(props.document.doc_id)
  }
  scrollToBottom()
  intervalId = setInterval(async () => {
    if (loading.value) {
      return
    }
    if (messages.value.length === 0) {
      messages.value = await loadChatMessages(props.document.doc_id)
    } else if (messages.value.some((message) => message.approved === 0)) {
      const updatedMessages = await loadChatMessages(props.document.doc_id)
      updatedMessages.forEach((updatedMessage) => {
        const index = messages.value.findIndex(
          (message) => message.message_id === updatedMessage.message_id
        )
        if (index !== -1 && messages.value[index].approved === 0) {
          messages.value[index] = updatedMessage
        }
      })
    }
  }, 3000) // 每 3 秒请求一次
})
onUnmounted(() => {
  clearInterval(intervalId)
})

watch(
  () => props.document,
  async (newValue, oldValue) => {
    messages.value = await loadChatMessages(newValue.doc_id)
  }
)

const role = ref('')
const prompt = ref('')
const loading = ref(false)
const entityRecognitionLoading = ref(false)

const showExportDialog = ref(false)
const exportMode = ref(false)
const checkedExport = ref(false)
const checkAll = ref(false)
const isIndeterminate = ref(false)
const checkedMessages = ref([])

const checkMessage = (message_id) => {
  if (checkedMessages.value.includes(message_id)) {
    checkedMessages.value = checkedMessages.value.filter((id) => id !== message_id)
  } else {
    checkedMessages.value.push(message_id)
  }
  const checkedCount = checkedMessages.value.length
  checkAll.value = checkedCount === messages.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < messages.value.length
}
provide('checkedMessages', checkedMessages)
provide('checkMessage', checkMessage)

const handleCheckAllChange = (val) => {
  checkedMessages.value = val ? messages.value.map((item) => item.message_id) : []
  isIndeterminate.value = false
}
const switchExport = (id) => {
  exportMode.value = !exportMode.value
  checkedMessages.value = []
  checkMessage(id)
}

const messages = ref([])
watch(
  () => messages,
  async (newValue, oldValue) => {
    scrollToBottom()
  },
  { deep: true }
)
const scrollContainer = ref<HTMLDivElement>()

const querySearch = async (queryString: string, cb: any) => {
  if (!queryString.startsWith('/')) {
    cb([])
    return
  }
  // 如果是，使用 substring 方法删除第一个斜杠
  queryString = queryString.substring(1)
  const response = await axios.get('/api/ai/function')
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
    cb([])
    reutrn
  }
  const data = response.data.data
  const functions = queryString
    ? data.page.List.filter(createFilter(queryString))
    : data.page.List
  cb(functions)
}
const createFilter = (queryString: string) => {
  return (item: Object) => {
    return (item.template_name.toLowerCase().indexOf(queryString.toLowerCase()) !== -1) ||
      (item.template.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
  }
}

const loadChatMessages = async (documentId) => {
  const params = {
    doc_id: documentId,
    page: -1
  }
  let response = await axios.get('/api/aigc/messages', { params })
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
  } else {
    const data = response.data.data
    return data.page.List
  }
}

const docNameEntityRecognition = async () => {
  entityRecognitionLoading.value = true
  const params = {
    book_identify: props.bookIdentify,
    doc_id: props.document.doc_id
  }
  const formData = new FormData()
  formData.append('book_identify', props.bookIdentify)
  formData.append('doc_id', props.document.doc_id)
  const response = await axios.post('/aigc/ner', formData)
  const data = response.data
  entityList.value = data.data?.page?.List || []
  emit('entityResults', data.data?.page?.List || [])
  entityRecognitionLoading.value = false
}

const checkRequestParam = async (prompt) => {
  const value = await ElMessageBox.prompt(prompt, '必填参数', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
  return value
}

const customizeChat = async (event) => {
  if (!isProxy(event)) {
    ElMessage.warning('访问方式错误')
    return
  }
  if (!('EventSource' in window)) {
    ElMessage.warning('您的浏览器不支持该功能')
    return
  }
  const func = toRaw(event)
  console.log(func)
  loading.value = true
  const params = {
    book_identify: props.bookIdentify,
    doc_id: props.document.doc_id,
    role: role.value,
    law: '',
    function_id: func.id,
  }
  // 必填利益方参数
  if (func.template.includes('{{ role }}') && (params.role || params.role === '')) {
    try {
      const value = await checkRequestParam('请输入利益方')
      params.role = value.value
    } catch (error) {
      if (error === 'cancel') {
        ElMessage.warning('请求取消')
        return
      }
    }
  }
  if (func.template.includes('{{ law }}') && (params.law || params.law === '')) {
    try {
      const value = await checkRequestParam('请输入参考法律')
      params.law = value.value
    } catch (error) {
      if (error === 'cancel') {
        ElMessage.warning('请求取消')
        return
      }
    }
  }
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  )
  console.log(filteredParams)
  const queryString = new URLSearchParams(filteredParams).toString()
  const url = `/aigc/customize_chat?${queryString}`
  const eventSource = new EventSource(url)
  eventSource.onmessage = (event) => {
    messages.value[messages.value.length - 1].response += event.data
  }
  eventSource.addEventListener('start', async (event) => {
    const message = JSON.parse(event.data)
    messages.value.push(message)
  })
  eventSource.addEventListener('warning', (event) => {
    ElMessage.warning(event.data)
  })
  eventSource.addEventListener('close', (event) => {
    ElMessage.warning(event.data)
    messages.value[messages.value.length - 1].approved = 1
  })
  eventSource.onerror = (event) => {
    eventSource.close()
    loading.value = false
  }
}

const docAnalyze = async (promptName) => {
  if (!('EventSource' in window)) {
    ElMessage.warning('您的浏览器不支持该功能')
    return
  }
  loading.value = true
  const params = {
    role: role.value,
    book_identify: props.bookIdentify,
    doc_id: props.document.doc_id,
    prompt: promptName,
    action: props.functions.includes(promptName) ? 'analyze' : 'chat'
  }
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== '')
  )
  const queryString = new URLSearchParams(filteredParams).toString()
  const url = `/aigc/chat?${queryString}`
  const eventSource = new EventSource(url)
  eventSource.onmessage = (event) => {
    messages.value[messages.value.length - 1].response += event.data
  }
  eventSource.addEventListener('start', async (event) => {
    const message = JSON.parse(event.data)
    messages.value.push(message)
  })
  eventSource.addEventListener('warning', (event) => {
    ElMessage.warning(event.data)
  })
  eventSource.addEventListener('close', (event) => {
    ElMessage.warning(event.data)
    messages.value[messages.value.length - 1].approved = 1
  })
  eventSource.onerror = (event) => {
    eventSource.close()
    loading.value = false
    prompt.value = ''
  }
}
const viewAnchor = ref()
const scrollToBottom = () => {
  nextTick(() => {
    viewAnchor.value.scrollIntoView()
  })
}

const updateMessege = (messageId, data) => {
  messages.value = messages.value.filter((el) => {
    if (el.message_id === messageId) {
      el.response = data
    }
    return el
  })
}

const handleDeleteMessage = async (id) => {
  messages.value = messages.value.filter((item) => item.message_id !== id)
  if (messages.value.length <= 0) {
    messages.value = await loadChatMessages(props.document.doc_id)
  }
}

const handleAiRequest = async () => {
  if (entityList.value.length === 0) {
    await ElMessageBox.confirm('是否确认文档无需脱敏处理？', 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    return
  }

  if (messages.value?.length !== 0) {
    await ElMessageBox.confirm('您已经用过AI功能，确认需要重新发起预请求吗？', 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage({
        type: 'success',
        message: 'completed'
      })
    })
  }
  props.functions.forEach(async (functions) => {
    await docAnalyze(functions)
  })

  ElMessage.success('操作成功')
}
</script>

<style>
.scroll-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}

.right-sidebar {
  width: 200px;
  background-color: #f9f9f9;
  border-left: 1px solid #eee;
  padding: 10px;
  overflow: hidden;
}

.no-scroll {
  overflow: hidden;
}

.export-box {
  height: auto;
  margin-right: 0;
  display: flex;
  align-items: stretch;
  justify-items: start;
}

.el-checkbox__label {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
</style>
