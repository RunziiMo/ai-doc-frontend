<script setup>
import { onMounted, reactive, computed, ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { createLoadingTask } from 'vue3-pdfjs'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const state = reactive({
  source: props.url, // 预览pdf文件地址
  pageNum: 1, // 当前页面
  scale: 1, // 缩放比例
  numPages: 0 // 总页数
})

const scale = computed(() => `transform:scale(${state.scale})`)

const lastPage = () => {
  if (state.pageNum > 1) {
    state.pageNum -= 1
  }
}
const nextPage = () => {
  if (state.pageNum < state.numPages) {
    state.pageNum += 1
  }
}
const pageZoomOut = () => {
  if (state.scale < 2) {
    state.scale += 0.1
  }
}
const pageZoomIn = () => {
  if (state.scale > 1) {
    state.scale -= 0.1
  }
}
const isLoading = ref(true)

onMounted(() => {
  const loadingTask = createLoadingTask(state.source)
  loadingTask.promise.then((pdf) => {
    state.numPages = pdf.numPages
  })
})
const handleDocumentLoad = (e) => {
  console.log(e)
}
const handleDocumentRender = () => {
  isLoading.value = false
}
const handleDocumentRenderFailed = (e) => {
  console.log('render failed', e)
}
const handleDocumentLoadingFailed = (e) => {
  console.log('error-loading failed', e)
}

const handlePasswordRequest = ({ callback, isWrongPassword }) => {
  callback(prompt(isWrongPassword ? 'Enter password again' : 'Enter password'))
}
</script>

<template>
  <div class="pdf-preview">
    <div class="pdf-wrap">
      <template v-if="isLoading"> Loading... </template>
      <vue-pdf-embed
        :source="state.source"
        :style="scale"
        class="vue-pdf-embed"
        :page="state.pageNum"
        @loaded="handleDocumentLoad"
        @rendered="handleDocumentRender"
        @password-requested="handlePasswordRequest"
        @rendering-failed="handleDocumentRenderFailed"
        @loading-failed="handleDocumentLoadingFailed"
      />
    </div>
    <div v-if="!isLoading" class="flex page-tool">
      <div class="page-tool-item" @click="lastPage">上一页</div>
      <div class="page-tool-item" @click="nextPage">下一页</div>
      <div class="page-tool-item">{{ state.pageNum }}/{{ state.numPages }}</div>
      <div class="page-tool-item" @click="pageZoomOut">放大</div>
      <div class="page-tool-item" @click="pageZoomIn">缩小</div>
    </div>
  </div>
</template>
<style>
.pdf-preview {
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  background-color: e9e9e9;
}

.pdf-wrap {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.vue-pdf-embed {
  text-align: center;

  height: 100%;
  border: 1px solid #e5e5e5;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-tool {
  position: absolute;
  bottom: 35px;
  padding-left: 15px;
  padding-right: 15px;
  display: flex;
  align-items: center;
  background: rgb(66, 66, 66);
  color: white;
  border-radius: 19px;
  z-index: 100;
  cursor: pointer;
  margin-left: 50%;
  transform: translateX(-50%);
}

.page-tool-item {
  padding: 8px 15px;
  padding-left: 10px;
  cursor: pointer;
}
</style>
