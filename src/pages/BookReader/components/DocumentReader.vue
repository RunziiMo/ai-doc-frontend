<script lang="ts" setup>
import { ref, computed, watch, watchEffect, nextTick, onMounted } from 'vue'
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
import { useElementBounding, onClickOutside } from '@vueuse/core'

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

const operatePopover = ref({
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
const docContainer = ref<HTMLDivElement>()

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

const getOffsetLeft = (element) => {
  let offset = 0
  while (element) {
    offset += element.offsetLeft
    element = element.offsetParent
  }
  return offset
}

const getOffsetTop = (element) => {
  let offset = 0
  if (element.offsetParent) {
    do {
      offset += element.offsetTop
      element = element.offsetParent
    } while (element)
  }
  return offset
}

const operatePopoverRef = ref<HTMLDivElement>()

const popover = (element: HTMLDivElement) => {
  let wrap = document.createElement('div')
  wrap.className = 'popover-wrap'
  let div = document.createElement('div')
  div.innerText = '置信度: 100%'
  div.className = 'popover-content'
  wrap.appendChild(div)

  element.appendChild(wrap)
}

const markText = () => {
  new Mark(docContainer.value).mark(['中国', '银行'], {
    className: 'text-selected',
    each: (element) => {
      console.log(element)
      popover(element)
      // let newElement = document.createElement('div') // 创建一个新的div元素
      // newElement.textContent = '置信度222' // 设置元素的内容
      // element.appendChild(newElement)
      element.onclick = function (e) {
        const { x, y, height } = useElementBounding(e.target)
        console.log(x.value, y.value)
        console.log(getOffsetTop(e.target), getOffsetLeft(e.target))
        operatePopover.value = {
          visible: true,
          top: y.value + height.value,
          left: x.value
        }
        nextTick(() => {
          onClickOutside(operatePopoverRef, (event) => {
            console.log(event, '点击了外部')
            operatePopover.value.visible = false
          })
        })
      }
    }
  })
}

onMounted(() => {
  setTimeout(() => {
    markText()
  }, 3000)
})
</script>

<template>
  <el-scrollbar v-if="isPdf" @scroll="() => (operatePopover.visible = false)">
    <div ref="docContainer" class="wh-full">
      <PdfView :url="url" />
    </div>
  </el-scrollbar>
  <el-scrollbar v-else-if="isDocx" @scroll="() => (operatePopover.visible = false)">
    <div ref="docContainer" />
  </el-scrollbar>
  <el-empty
    v-else-if="document.markdown !== undefined && document.markdown === ''"
    description="空白文档"
  >
  </el-empty>
  <el-skeleton v-else :rows="20" animated />
  <Teleport v-if="operatePopover.visible" to="body">
    <div
      ref="operatePopoverRef"
      class="operate-popover"
      :style="{ top: operatePopover.top + 'px', left: operatePopover.left + 'px' }"
    >
      <div class="py-1 bg-gray-100 text-center">编辑</div>
      <div class="py-1 bg-gray-100 mt-2 text-center">删除</div>
    </div>
  </Teleport>
</template>

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
.el-scrollbar {
  width: 100%;
  height: 100%;
}
.text-selected {
  background: red !important;
  cursor: pointer;
  position: relative;
}
.operate-popover {
  position: absolute;
  z-index: 20;
  padding: 16px;
  cursor: pointer;
  width: 100px;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 3%),
    0 6px 16px 4px rgb(0 0 0 / 9%),
    0 3px 6px -2px rgb(0 0 0 / 20%);
  user-select: none;
}

.popover-wrap {
  position: absolute;
  z-index: 500;
  padding: 16px;
  font-size: 14px;
  letter-spacing: unset;
  width: 100px;
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
</style>
