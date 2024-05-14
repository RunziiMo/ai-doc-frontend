<script lang="ts" setup>
import { ref, computed, watch, watchEffect, nextTick } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import { ElScrollbar } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import { marked } from 'marked'
import 'splitpanes/dist/splitpanes.css'
import axios from 'axios'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
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
const docxContainer = ref<HTMLDivElement>()

const loadDocument = async (bookIdentify, docId, docIdentify) => {
  const url = `/api/book/${bookIdentify}/download/${docId}`
  // if (docIdentify.endsWith(".pdf")) {
  //     // pdf
  //     pdfjsDist.GlobalWorkerOptions.workerSrc = pdfWorkerMin.default
  //     // const url_test = '/assets/test_1.pdf'    // 测试url
  //     const loadingTask = pdfjsDist.getDocument({ url: url });
  //     const pdf = await loadingTask.promise;
  //     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  //         const page = await pdf.getPage(pageNum);
  //         const scale = 1.5;
  //         const viewport = page.getViewport({ scale });
  //         const canvas = document.createElement('canvas');
  //         const context = canvas.getContext('2d');
  //         canvas.width = viewport.width;
  //         canvas.height = viewport.height;
  //         const renderContext = {
  //             canvasContext: context,
  //             viewport: viewport,
  //         };
  //         await page.render(renderContext).promise;
  //         // Append the canvas to the div
  //         docxContainer.value.appendChild(canvas);
  //     }
  // } else {
  // docx
  let response = await axios.get(url, {
    responseType: 'blob' // 设置响应类型为 blob
  })
  const docxOptions = Object.assign(defaultOptions, {
    inWrapper: false,
    ignoreWidth: true,
    experimental: true
  })
  await renderAsync(response.data, docxContainer.value, null, docxOptions)
  // }
}

const toast = (message) => {
  ElMessage.warning(message)
}
const scrollToText = async (searchString) => {
  new Mark(docxContainer.value).unmark().mark(searchString, {
    acrossElements: true,
    accuracy: 'partially'
  })
  await nextTick() // 等待DOM更新
  const elements = docxContainer.value.querySelectorAll('mark') // 假设被高亮的文本被<mark>标签包裹
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
</script>

<template>
  <!--vue-office-docx
        v-if="bookIdentify && document.doc_id"
        :src="`/api/book/${bookIdentify}/download/${document.doc_id}`"
        @error="toast('加载文档失败')"
    /-->
  <el-scrollbar v-if="isPdf">
    <PdfView :url="url" />
  </el-scrollbar>
  <el-scrollbar v-else-if="isDocx">
    <div ref="docxContainer" />
  </el-scrollbar>
  <el-empty
    v-else-if="document.markdown !== undefined && document.markdown === ''"
    description="空白文档"
  >
  </el-empty>
  <el-skeleton v-else :rows="20" animated />
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
</style>
