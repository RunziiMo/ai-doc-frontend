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
import {ElMessage} from 'element-plus'
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

const isPdf = computed(() => {
  return props.document.identify?.endsWith('.pdf')
})

const operatePopover = ref({
  visible: false,
  top: 0,
  left: 0,
})

watch(
  () => props.document,
  (newValue, oldValue) => {
    if(isPdf.value) return;
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
    let offset = 0;  
    while (element) {  
        offset += element.offsetLeft;  
        element = element.offsetParent;  
    }  
    return offset;  
}

const getOffsetTop = (element) =>{  
    let offset = 0;  
    if (element.offsetParent) {  
        do {  
            offset += element.offsetTop;  
            element = element.offsetParent;  
        } while (element);  
    }  
    return offset;  
}  

onMounted(()=> {
  setTimeout(() => {
    new Mark(docContainer.value).mark([
     '中国',
     '银行'
  ], {
    each: (element) => {
      console.log(element)
      element.onclick = function (e) {
       
        operatePopover.value = {
             visible: true,
             top: getOffsetTop(e),
             left: getOffsetLeft(e),
           }
      }
    }
  })
  }, 3000);

})
</script>

<template>
  <el-scrollbar v-if="isPdf">
    <div ref="docContainer" class="wh-full">
      <PdfView :url="url" />
    </div>
  </el-scrollbar>
  <el-scrollbar v-else-if="isDocx">
    <div ref="docContainer" />
  </el-scrollbar>
  <el-empty
    v-else-if="document.markdown !== undefined && document.markdown === ''"
    description="空白文档"
  >
  </el-empty>
  <el-skeleton v-else :rows="20" animated />

  <div
    v-if="operatePopover.visible"
    class="operate-popover"
    :style="{ top: operatePopover.top + 'px', left: operatePopover.left + 'px' }"
  >
      <div class="py-1 bg-gray-100 text-center">取 消</div>
      <div class="py-1 bg-gray-100 mt-2 text-center">重 选</div>
    </div>
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
  height: 100%
}
.text-selected {
  background: red !important;
}
.operate-popover {
  position: absolute;
  z-index: 20;
  padding: 16px;
  cursor: pointer;
  width: 100px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 9px 28px 8px rgb(0 0 0 / 3%), 0 6px 16px 4px rgb(0 0 0 / 9%),
    0 3px 6px -2px rgb(0 0 0 / 20%);
  user-select: none;
}
</style>
