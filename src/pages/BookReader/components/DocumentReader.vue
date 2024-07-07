<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  watchEffect,
  nextTick,
  onMounted,
  reactive,
  resolveComponent,
  h
} from 'vue'
import { useMouseInElement } from '@vueuse/core'
import { Splitpanes, Pane } from 'splitpanes'
import { ElScrollbar } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import { marked } from 'marked'
import 'splitpanes/dist/splitpanes.css'
import axios from 'axios'
import { defaultOptions, renderAsync } from 'docx-preview'
import Mark from 'mark.js'
import { ElMessage } from 'element-plus'
import PdfView from './PdfView.vue'
const props = defineProps({
  bookIdentify: {
    type: String,
    required: true
  },
  document: {
    type: Object,
    required: true
  },
  searchString: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['fileRenderFinished'])

const isPdf = computed(() => {
  return props.document.identify?.endsWith('.pdf')
})

const addPopover = ref({
  visible: false,
  top: 0,
  left: 0
})

const loadDocument = async (bookIdentify, docId, docIdentify) => {
  const url = `/api/book/${bookIdentify}/download/${docId}`
  let response = await axios.get(url, {
    responseType: 'blob' // 设置响应类型为 blob
  })
  const docxOptions = Object.assign(defaultOptions, {
    inWrapper: false,
    ignoreWidth: true,
    experimental: true
  })
  await renderAsync(response.data, docContainer.value, null, docxOptions).then(() => {
    handleRendered()
  })
}

const getEntityList = async (docId: string) => {
  const { data } = await axios.get(`/api/document/${docId}/entity`)
  if (data.errcode !== 0) {
    entityList.value = []
  } else {
    entityList.value = data.data.page.List || []
  }
}

watch(
  () => props.document,
  (newValue, oldValue) => {
    getEntityList(newValue.doc_id)
    if (isPdf.value) return
    loadDocument(props.bookIdentify, newValue.doc_id, newValue.identify)
  }
)

watch(
  () => props.searchString,
  (newValue, oldValue) => {
    scrollToText(newValue)
  }
)
const docContainer = ref<HTMLDivElement>(null)

const addPopoverRef = ref()

const editEntitysModel = reactive({
  type: '',
  replaced_text: '',
  confidence: ''
})

const editPopover = ref({
  visible: false,
  top: 0,
  left: 0
})

const disabledEditEntity = ref(true)

const markEntitys = defineModel('markEntitys', {
  type: Function,
  default: () => {}
})

markEntitys.value = (entitys) => {
  const mark = new Mark(docContainer.value)
  const ranges = entitys?.map((el) => ({
    start: el.start_index,
    length: el.end_index - el.start_index,
    data: el
  }))
  const options = {
    className: 'text-selected',
    each: (element, range) => {
      element.onmouseenter = function () {
        const data = range.data
        Object.assign(editEntitysModel, {
          type: data.type,
          replaced_text: data.replaced_text,
          confidence: data.confidence
        })
        const { left, bottom } = element.getBoundingClientRect()
        console.log(left, bottom)
        editPopover.value.top = bottom
        editPopover.value.left = left
        editPopover.value.visible = true
      }
    },
    done: async function () {}
  }
  mark.markRanges(ranges, options)
}

const { x: mouseX, y: mouseY, isOutside } = useMouseInElement(docContainer.value)
const { isOutside: isAddPopoverOutside } = useMouseInElement(addPopoverRef.value)

const handleMouseUp = (e) => {
  console.log(e.target, '====tager')
  const selection = window.getSelection()
  console.log(selection)
  // let selRange = selection.getRangeAt(0)
  let selectedText = selection.toString()
  if (selectedText) {
    if (!isOutside.value) {
      addPopover.value = {
        visible: true,
        top: mouseY.value,
        left: mouseX.value
      }
    }
  }
  console.log(isAddPopoverOutside.value, '====isAddPopoverOutside.value')
  if (isAddPopoverOutside.value) {
    addPopover.value.visible = false
  }
}

const entityInfo = reactive({
  type: '',
  replaced_text: '',
  confidence: ''
})
const entityList = defineModel('entityList', {
  type: Array,
  default: () => []
})
entityList.value = []

const handleRendered = () => {
  console.log(entityList.value, '===entityList.value')
  if (entityList.value.length !== 0) {
    markEntitys.value?.(entityList.value)
  }
  emit('fileRenderFinished')
}

const toast = (message) => {
  ElMessage.warning(message)
}
const scrollToText = async (searchString) => {
  new Mark(docContainer.value).unmark().mark(searchString, {
    acrossElements: true,
    accuracy: 'partially'
  })
  await nextTick() // 等待DOM更新
  const elements = docContainer.value.querySelectorAll('mark') // 假设被高亮的文本被<mark>标签包裹
  if (elements.length > 0) {
    const firstElement = elements[0]
    firstElement.scrollIntoView({ behavior: 'smooth' })
    // 如果使用<el-scrollbar>，则可能需要使用其API来滚动
    // scrollbar.value?.scrollToElement(firstElement); // 假设Element Plus提供了这样的API
  } else {
    ElMessage.warning('原文未找到【' + searchString + '】')
  }
}

const isDocx = computed(() => {
  return props.document.identify?.endsWith('.docx')
})
const url = computed(() => {
  return `/api/book/${props.bookIdentify}/download/${props.document?.doc_id}`
})

const handleEdit = (item) => {
  console.log(item)
}
const handleDelete = (item) => {
  console.log(item)
}
const handleAdd = () => {}
const typeList = [
  {
    label: '人名',
    value: 'PERSON'
  },
  {
    label: '地名',
    value: 'LOCATION'
  },
  {
    label: '金额',
    value: '金额'
  },
  {
    label: '组织',
    value: '组织'
  },
  {
    label: '日期',
    value: 'DATE_TIME'
  }
]
</script>

<template>
  <el-scrollbar
    v-if="isPdf"
    @scroll="() => ((addPopover.visible = false), (editPopover.visible = false))"
  >
    <div ref="docContainer" class="wh-full" @mouseup.stop="handleMouseUp">
      <PdfView :url="url" @rendered="handleRendered" />
    </div>
  </el-scrollbar>
  <el-scrollbar
    v-else-if="isDocx"
    @scroll="() => ((addPopover.visible = false), (editPopover.visible = false))"
  >
    <div ref="docContainer" @mouseup.stop="handleMouseUp" />
  </el-scrollbar>
  <el-empty
    v-else-if="document.markdown !== undefined && document.markdown === ''"
    description="空白文档"
  >
  </el-empty>
  <el-skeleton v-else :rows="20" animated />
  <Teleport v-if="addPopover.visible" to="body">
    <div
      ref="addPopoverRef"
      class="add-popover"
      :style="{ top: addPopover.top + 'px', left: addPopover.left + 'px' }"
    >
      <div class="flex gap-10px w-100%">
        <el-select placeholder="type" size="small" :teleported="false" v-model="entityInfo.type">
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input v-model="entityInfo.replaced_text" size="small" placeholder="替换文本" />
        <el-input v-model="entityInfo.confidence" size="small" placeholder="置信度" />
      </div>
      <div class="flex w-100% m-t-8px">
        <el-button class="flex-1" type="primary" size="small" @click="handleAdd"> 确定 </el-button>
      </div>
    </div>
  </Teleport>
  <Teleport v-if="editPopover.visible" to="body">
    <div
      class="edit-popover"
      :style="{ top: editPopover.top + 'px', left: editPopover.left + 'px' }"
      @mouseup.stop
    >
      <div class="flex gap-10px w-100%">
        <el-select
          placeholder="type"
          size="small"
          v-model="editEntitysModel.type"
          :disabled="disabledEditEntity"
          :teleported="false"
        >
          <el-option
            v-for="type in typeList"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
        <el-input
          v-model="editEntitysModel.replaced_text"
          size="small"
          placeholder="替换文本"
          :disabled="disabledEditEntity"
        />
        <el-input
          v-model="editEntitysModel.confidence"
          size="small"
          placeholder="置信度"
          :disabled="disabledEditEntity"
        />
      </div>
      <div class="flex w-100% m-t-8px">
        <el-button
          v-if="disabledEditEntity"
          class="flex-1"
          type="primary"
          size="small"
          @click="disabledEditEntity = false"
          @mouseenter.prevent
          @mouseleave.prevent
        >
          编辑
        </el-button>
        <template v-else>
          <el-button class="flex-1" type="primary" size="small" @click="handleEdit">
            确定
          </el-button>
          <el-button class="flex-1" type="primary" size="small" @click="disabledEditEntity = true">
            取消
          </el-button>
        </template>

        <el-button
          class="flex-1"
          size="small"
          @click="handleDelete"
          @mouseenter.prevent
          @mouseleave.prevent
          >删除</el-button
        >
      </div>
    </div>
  </Teleport>
</template>

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
.el-scrollbar {
  width: 100%;
  height: 100%;
}
:deep(.text-selected) {
  background: #d48a91 !important;
  cursor: pointer;
  position: relative;
  user-select: none;
}
:deep(.edit-popover) {
  left: 0;
}
</style>
<style>
.add-popover,
.edit-popover {
  position: absolute;
  z-index: 200;
  padding: 16px;
  cursor: pointer;
  width: 200px;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 3%),
    0 6px 16px 4px rgb(0 0 0 / 9%),
    0 3px 6px -2px rgb(0 0 0 / 20%);
  user-select: none;
}
.edit-popover span {
  color: #606266 !important;
  position: unset !important;
  white-space: unset !important;
  cursor: unset !important;
  transform-origin: unset !important;
  -webkit-user-select: none !important; /* Chrome, Safari, Opera */
  -moz-user-select: none !important; /* Firefox */
  -ms-user-select: none !important; /* Internet Explorer/Edge */
  user-select: none !important;
}
.edit-popover .el-button--primary span {
  color: #fff !important;
}
.edit-popover .el-select {
  text-indent: 0pt !important;
}
</style>
