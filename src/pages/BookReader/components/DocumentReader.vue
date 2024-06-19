<script lang="ts" setup>
import { ref, computed, watch, watchEffect, nextTick, onMounted, reactive } from 'vue'
import { useElementBounding, useMouseInElement } from '@vueuse/core'
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
import { RefSymbol } from '@vue/reactivity'

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

const isPdf = computed(() => {
  return props.document.identify?.endsWith('.pdf')
})

const addPopover = ref({
  visible: false,
  top: 0,
  left: 0
})

watch(
  () => props.document,
  (newValue, oldValue) => {
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
  await renderAsync(response.data, docContainer.value, null, docxOptions)
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

const addPopoverRef = ref()

const handleAdd = () => {
  // 添加
  console.log('添加')
}

const handleEdit = () => {
  // 编辑
  console.log('编辑')
}

const handleDelete = () => {
  // 删除
  console.log('删除')
}

const popover = (element) => {
  const wrap = document.createElement('div')
  const tmp = document.createDocumentFragment()

  wrap.className = 'popover-wrap'
  wrap.setAttribute('hide', '1')

  const confidence = document.createElement('div')
  confidence.innerText = '置信度: 100%'
  const replaceText = document.createElement('div')
  replaceText.innerText = `替换文本：${'测试'}`
  const type = document.createElement('div')
  type.innerText = `类型：${'测试'}`
  const action = document.createElement('div')
  action.className = 'action-wrap'
  const addButton = document.createElement('div')
  addButton.innerText = '添加'
  addButton.className = 'button add'
  addButton.onclick = handleAdd
  const editButton = document.createElement('div')
  editButton.innerText = '编辑'
  editButton.className = 'button edit'
  editButton.onclick = handleEdit
  const deleteButton = document.createElement('div')
  deleteButton.innerText = '删除'
  deleteButton.className = 'button delete'
  deleteButton.onclick = handleDelete
  action.appendChild(addButton)
  action.appendChild(editButton)
  action.appendChild(deleteButton)

  tmp.appendChild(confidence)
  tmp.appendChild(replaceText)
  tmp.appendChild(type)
  tmp.appendChild(action)
  wrap.appendChild(tmp)

  element.appendChild(wrap)
}

const markText = () => {
  new Mark(docContainer.value).mark(['中国', '银行'], {
    className: 'text-selected',
    each: (element) => {
      console.log(element)
      popover(element)

      element.onclick = function (e) {
        console.log(e.target)
        const popup = e.target.querySelector('.popover-wrap')

        const hide = popup.getAttribute('hide')
        console.log(hide)
        if (hide === '0') {
          popup.setAttribute('hide', 1)
          popup.style.display = 'none'
        } else {
          popup.setAttribute('hide', 0)
          popup.style.display = 'block'
        }
      }
    }
  })
}

const { x: mouseX, y: mouseY, isOutside } = useMouseInElement(docContainer.value)

const handleMouseUp = (e) => {
  console.log(e.target, '==e.target')
  const { x, y, width, height } = useElementBounding(e.target)
  const selection = window.getSelection()
  console.log(selection, '===selection')
  if (!isOutside.value) {
    console.log(mouseX.value, mouseY.value)
  }

  addPopover.value = {
    visible: true,
    top: mouseY.value,
    left: mouseX.value
  }
  console.log(e.target)
  console.log(addPopover.value, width.value, height.value, x.value, y.value)
  // const target = e.target
  // const popup = target.querySelector('.popover-wrap')
  // if (popup) {
  //   const hide = popup.getAttribute('hide')
  //   if (hide === '0') {
  //     popup.setAttribute('hide', 1)
  //     popup.style.display = 'none'
  //   } else {
  //     popup.setAttribute('hide', 0)
  //     popup.style.display = 'block'
  //   }
  // }
}

const entityInfo = reactive({
  type: '',
  replaced_text: '',
  confidence: ''
})

onMounted(() => {
  setTimeout(() => {
    markText()
  }, 1000)
})
</script>

<template>
  <el-scrollbar v-if="isPdf" @scroll="() => (addPopover.visible = false)">
    <div ref="docContainer" class="wh-full" @mouseup="handleMouseUp">
      <PdfView :url="url" />
    </div>
  </el-scrollbar>
  <el-scrollbar v-else-if="isDocx" @scroll="() => (addPopover.visible = false)">
    <div ref="docContainer" @mouseup="handleMouseUp" />
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
      <el-input placeholder="type" v-model="entityInfo.type" /><el-input
        v-model="entityInfo.replaced_text"
        placeholder="替换文本"
      /><el-input v-model="entityInfo.confidence" placeholder="置信度" />
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

:deep(.popover-wrap) {
  position: absolute;
  z-index: 500;
  padding: 8px;
  font-size: 14px;
  letter-spacing: unset;
  width: 143px;
  bottom: 18px;
  left: 0;
  background: #fff;
  border-radius: 4px;
  color: #333 !important;
  opacity: unset !important;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 3%),
    0 6px 16px 4px rgb(0 0 0 / 9%),
    0 3px 6px -2px rgb(0 0 0 / 20%);
  user-select: none;
  text-indent: 0;
}
:deep(.action-wrap) {
  margin-top: 8px;
  display: flex;
}
:deep(.button) {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #ccc;
  margin-right: 8px;
  cursor: pointer;
}
:deep(.button:hover) {
  background: #f5f5f5;
}
:deep(.button:active) {
  background: #e5e5e5;
}
:deep(.button:focus) {
  outline: none;
}
:deep(.button:last-child) {
  margin-right: 0;
}
:deep(.hide) {
  display: none;
}
</style>
<style>
.add-popover {
  position: absolute;
  z-index: 20;
  padding: 16px;
  cursor: pointer;
  width: 260px;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 3%),
    0 6px 16px 4px rgb(0 0 0 / 9%),
    0 3px 6px -2px rgb(0 0 0 / 20%);
  user-select: none;
  display: flex;
  gap: 10px;
}
</style>
