<script lang="ts" setup>
import {
  ref,
  computed,
  watch,
  nextTick,
} from 'vue'
import { ElScrollbar } from 'element-plus'
import 'splitpanes/dist/splitpanes.css'
import axios from 'axios'
import { defaultOptions, renderAsync } from 'docx-preview'
import Mark from 'mark.js'
import { ElMessage } from 'element-plus'
import PdfView from './PdfView.vue'

const props = defineProps({
  searchString: {
    type: String,
    required: true
  },
  currentMessage: {
    type: Object,
    required: true
  },
})

const fileName = computed(() => {
    try {
        const context = JSON.parse(props.currentMessage.slots)
        return context?.context?.[0]
    } catch (error) {
        return undefined;
    }
})

const emit = defineEmits(['fileRenderFinished', 'refreshEntity'])

const isPdf = computed(() => {
  return fileName.value && fileName.value?.endsWith('.pdf')
})

const isDocx = computed(() => {
  return fileName.value && fileName.value?.endsWith('.docx')
})
const url = computed(() => {
  return `/law_files/${fileName.value}`
})

const loadDocument = async () => {
  if(!fileName.value) return;
  let response = await axios.get(url.value, {
    responseType: 'blob' // 设置响应类型为 blob
  })
  const docxOptions = Object.assign (defaultOptions, {
    inWrapper: false,
    ignoreWidth: true,
    experimental: true
  })
  await renderAsync(response.data, docContainer.value, null, docxOptions);
  scrollToText(props.searchString)
}

watch(
  () => props.currentMessage,
  async () => {
    if (isPdf.value) return
    await loadDocument()
  }
)

watch(
  () => props.searchString,
  (newValue) => {
    scrollToText(newValue)
  }
)
const docContainer = ref<HTMLDivElement>(null)


const scrollToText = async (searchString) => {
    console.log(docContainer)
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
</script>

<template>
  <el-scrollbar
    v-if="isPdf"
  >
    <div ref="docContainer" class="wh-full" >
      <PdfView :url="url" />
    </div>
  </el-scrollbar>
  <el-scrollbar
    v-else-if="isDocx"
  >
    <div ref="docContainer"/>
  </el-scrollbar>
  <el-empty
    v-else-if="fileName === undefined"
    description="空白文档"
  >
  </el-empty>
  <el-skeleton v-else :rows="20" animated />
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

</style>
