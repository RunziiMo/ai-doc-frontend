<template>
  <div class="w-full h-full flex flex-col">
    <DocumentOperate
      v-model:entityRecognitionLoading="entityRecognitionLoading"
      v-model:entityList="entityList"
      @ai-pre-request="handleAiRequest"
      @anonymous-processing="docNameEntityRecognition"
      @request-entity-result="$emit('requestEntityResult')"
    />
    <div style="height: calc(100% - 40px)">
      <splitpanes horizontal class="w-100% h-100%">
        <pane v-if="!isRetract && entityList.length > 0">
          <EntityJudgeResult
            v-loading="entityTableLoading"
            :document="document"
            :markEntitys="markEntitys"
            :book="book"
            :entity-list="entityList"
            @traceability="(data) => $emit('traceability', data)"
            @retract="$emit('retract')"
          />
        </pane>
        <pane>
          <div class="w-full h-full flex flex-col">
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
                @get-message="(val) => $emit('getMessage', val)"
              >
              </ChatMessage>
              <div ref="viewAnchor" />
            </div>
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
                  <div class="flex justify-between">
                    <div class="flex flex-col">
                      <el-text class="self-start">{{ item.template_name }}</el-text>
                    </div>
                    <el-text truncated>{{ item.template }}</el-text>
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
                @click="docAnalyzes(prompt)"
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
              <el-button @click="showExportDialog = true" class="w-30" type="primary"
                >导出</el-button
              >
            </div>
            <ExportDialog
              v-model:showDialog="showExportDialog"
              :document="document"
              :messages="messages"
            />
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, watch, onMounted, onUnmounted, nextTick, provide, inject, type Ref } from 'vue'
import { isProxy, toRaw } from 'vue'
import { ElMessage, ElMessageBox, ElOption, ElSelect } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import axios from 'axios'
import ExportDialog from './ExportDialog.vue'
import DocumentOperate from './DocumentOperate.vue'
import { Splitpanes, Pane } from 'splitpanes'
import EntityJudgeResult from './EntityJudgeResult.vue'

const entityList = defineModel('entityList', {
  type: Array,
  default: [],
})
const currentSelectDocId = inject<Ref<number>>('currentSelectDocId')
const props = defineProps({
  bookIdentify: {
    type: String,
    required: true,
  },
  book: {
    type: Object,
    required: true,
  },
  document: {
    type: Object,
    required: true,
  },
  functions: {
    type: Array,
    required: true,
  },
  checkedFiles: {
    type: Array,
    required: true,
  },
  documents: {
    type: Array,
    required: true,
  },
  entityTableLoading: {
    type: Boolean,
    required: true,
  },
  isRetract: {
    type: Boolean,
    required: true,
  },
  docId: {
    type: Number,
    required: true,
  },
  markEntitys: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'textSelected',
  'entityResults',
  'getMessage',
  'traceability',
  'requestEntityResult',
  'retract',
])
const startInterval = () => {
  const intervalId = setInterval(async () => {
    if (loading.value) {
      return
    }
    if (messages.value?.length === 0) {
      messages.value = await loadChatMessages(props.document.doc_id)
    } else if (messages.value.some((message) => message.approved === 0)) {
      const updatedMessages = await loadChatMessages(props.document.doc_id)
      updatedMessages.forEach((updatedMessage) => {
        const index = messages.value.findIndex(
          (message) => message.message_id === updatedMessage.message_id,
        )
        if (index !== -1 && messages.value[index].approved === 0) {
          messages.value[index] = updatedMessage
        }
      })
    }
  }, 3000) // 每 3 秒请求一次
  return intervalId
}
let intervalId = startInterval()

const initInterval = (val) => {
  if (val === props.docId) {
    stopInterval()
    intervalId = startInterval()
  } else {
    stopInterval()
  }
}
const stopInterval = () => {
  clearInterval(intervalId)
  intervalId = null
}

initInterval(currentSelectDocId.value)

watch(currentSelectDocId, (val) => {
  initInterval(val)
})

onMounted(async () => {
  if (props.document?.doc_id) {
    messages.value = await loadChatMessages(props.document.doc_id)
  }
  scrollToBottom()
})
onUnmounted(() => {
  clearInterval(intervalId)
})

const prompt = ref('')
const loading = ref(false)
const entityRecognitionLoading = ref(false)

const showExportDialog = ref(false)
const exportMode = ref(false)
const checkAll = ref(false)
const isIndeterminate = ref(false)
const checkedMessages = ref([])

const setEntityRecognitionStore = inject<Function>('setEntityRecognitionStore')

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
  () => {
    scrollToBottom()
  },
  { deep: true },
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
    return
  }
  const data = response.data.data
  const functions = queryString ? data.page.List.filter(createFilter(queryString)) : data.page.List
  cb(functions)
}
const createFilter = (queryString: string) => {
  return (item: any) => {
    return (
      item.template_name.toLowerCase().indexOf(queryString.toLowerCase()) !== -1 ||
      item.template.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
    )
  }
}

const loadChatMessages = async (documentId) => {
  const params = {
    doc_id: documentId,
    page: -1,
  }
  let response = await axios.get('/api/aigc/messages', { params })
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
  } else {
    const data = response.data.data
    return data.page.List || []
  }
}

const docNameEntityRecognition = async () => {
  entityRecognitionLoading.value = true
  const formData = new FormData()
  formData.append('book_identify', props.bookIdentify)
  formData.append('doc_id', props.document.doc_id)
  const response = await axios.post('/aigc/ner', formData)
  const data = response.data
  entityList.value = data.data?.page?.List || []
  emit('entityResults', data.data?.page?.List || [])
  entityRecognitionLoading.value = false
  setEntityRecognitionStore?.(true)
}

watch(
  () => props.document,
  async (newValue, oldValue) => {
    if (newValue?.doc_id !== oldValue?.doc_id) {
      entityRecognitionLoading.value = false
    }
    messages.value = await loadChatMessages(newValue.doc_id)
  },
)

const checkRequestParam = async (prompt, options) => {
  const selectedOption = ref(null)
  if (options !== undefined && options.length > 0) {
    options = options.map((option) => ({
      value: option,
      label: option,
    }))
    return new Promise((resolve, reject) => {
      ElMessageBox({
        title: prompt,
        // Should pass a function if VNode contains dynamic props
        message: () =>
          h(
            ElSelect,
            {
              modelValue: selectedOption.value,
              placeholder: '请选择选项',
              'onUpdate:modelValue': (val) => {
                selectedOption.value = val
              },
              style: {
                width: '200px', // 设置宽度为 100%
              },
            },
            options.map((option) =>
              h(ElOption, {
                key: option.value,
                label: option.label,
                value: option.value,
              }),
            ),
          ),
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        showCancelButton: true,
        beforeClose: (action, _instance, done) => {
          if (action === 'confirm') {
            console.log('Selected option:', selectedOption.value)
            resolve(selectedOption.value)
          } else {
            reject(new Error('User cancelled the operation'))
          }
          done()
        },
      })
    })
  } else {
    return ElMessageBox.prompt(prompt, '必填参数', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })
  }
}

const customizeChat = async (event) => {
  let func = event
  if (isProxy(event)) {
    func = toRaw(event)
  }
  if (!('EventSource' in window)) {
    ElMessage.warning('您的浏览器不支持该功能')
    return
  }
  console.log(func)
  loading.value = true
  const params = {
    book_identify: props.bookIdentify,
    doc_id: props.document.doc_id,
    role: '',
    law: '',
    function_id: func.id,
  }
  // 必填利益方参数
  if (func.template.includes('{{ role }}') && (params.role || params.role === '')) {
    try {
      const value = await checkRequestParam('请输入利益方', {})
      params.role = (value as any).value
    } catch (error) {
      ElMessage.warning('请求取消')
      return
    }
  }
  if (func.template.includes('{{ law }}') && (params.law || params.law === '')) {
    try {
      const response = await axios.get('/api/ai/law')
      if (response.data.errcode !== 0) {
        ElMessage.warning(response.data.message)
        return
      }
      const data = response.data.data
      const value = await checkRequestParam('请输入参考法律', data)
      params.law = value as string;
    } catch (error) {
      ElMessage.warning('请求取消')
      return
    }
  }
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
  )
  console.log(filteredParams)
  const queryString = new URLSearchParams(filteredParams).toString()
  const url = `/aigc/customize_chat?${queryString}`

  return new Promise((resolve) => {
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
    eventSource.onerror = () => {
      eventSource.close()
      loading.value = false
      resolve(void 0)
    }
  })
}

const docAnalyzes = (promptName) => {
  if (props.checkedFiles.length > 10) {
    ElMessage.warning('最多只能选择10个文件')
    return
  }
  if (props.checkedFiles.length > 1) {
    const fileNames = props.documents
      ?.filter((el: any) => props.checkedFiles.includes(el.id))
      .map((el: any) => el.text)
      .join('、')

    ElMessageBox.confirm(
      `<div>是否对<div class="c-blue inline"> ${fileNames} </div>批量询问？</div>`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      },
    ).then(async () => {
      props.checkedFiles?.forEach(async (el) => {
        await docAnalyze(el)
      })
    })
  } else {
    docAnalyze(promptName)
  }
}

const docAnalyze = async (promptName, docId = props.document.doc_id) => {
  if (!('EventSource' in window)) {
    ElMessage.warning('您的浏览器不支持该功能')
    return
  }
  loading.value = true
  const params = {
    role: '',
    book_identify: props.bookIdentify,
    doc_id: docId,
    prompt: promptName,
    action: props.functions.includes(promptName) ? 'analyze' : 'chat',
  }
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
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
  eventSource.onerror = () => {
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

const customizeChatbySelectFunction = async (event, docId = props.document.doc_id) => {
  let func = event
  if (isProxy(event)) {
    func = toRaw(event)
  }
  if (!('EventSource' in window)) {
    ElMessage.warning('您的浏览器不支持该功能')
    return
  }
  loading.value = true
  const params = {
    book_identify: props.bookIdentify,
    doc_id: docId,
    role: func.role,
    law: func.law,
    function_id: func.id,
  }
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== ''),
  )
  const queryString = new URLSearchParams(filteredParams).toString()
  const url = `/aigc/customize_chat?${queryString}`

  return new Promise((resolve) => {
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
      if (messages.value[messages.value.length - 1]) {
        messages.value[messages.value.length - 1].approved = 1
      }
    })
    eventSource.onerror = () => {
      eventSource.close()
      loading.value = false
      resolve(void 0)
    }
  })
}

const handleAiRequest = async (funes) => {
  try {
    if (entityList.value.length === 0) {
      const value = await ElMessageBox.confirm('是否确认文档无需脱敏处理？', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      if (value !== 'confirm') {
        return
      }
    }

    if (messages.value?.length !== 0) {
      const value = await ElMessageBox.confirm(
        '您已经用过AI功能，确认需要重新发起预请求吗？',
        'Warning',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
      if (value !== 'confirm') {
        return
      }
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.warning('请求取消')
      return
    }
  }

  if (props.checkedFiles.length > 10) {
    ElMessage.warning('最多只能选择10个文件')
    return
  }
  if (props.checkedFiles.length > 1) {
    const fileNames = props.documents
      ?.filter((el: any) => props.checkedFiles.includes(el.id))
      .map((el: any) => el.text)
      .join('、')

    ElMessageBox.confirm(
      `<div>预请求会对<div class="c-blue inline"> ${fileNames} </div>批量询问？</div>`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      },
    ).then(async () => {
      try {
        for (const item of funes) {
          for (const docId of props.checkedFiles) {
            await customizeChatbySelectFunction(item, docId)
          }
        }
        ElMessage.success('操作成功')
      } catch (error) {
        console.log(error)
        loading.value = false
      }
    })
  } else {
    for (const item of funes) {
      await customizeChatbySelectFunction(item)
    }
    ElMessage.success('操作成功')
  }
}
</script>

<style scoped>
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
