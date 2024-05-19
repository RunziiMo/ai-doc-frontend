<script setup>
import { computed, ref } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
// import { createLoadingTask } from 'vue3-pdfjs'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

// const scale = computed(() => `transform:scale(${state.scale})`)

const isLoading = ref(true)
const pdfRef = ref()

// onMounted(() => {
//   const loadingTask = createLoadingTask(state.source)
//   loadingTask.promise.then((pdf) => {
//     state.numPages = pdf.numPages
//   })
// })

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
      <template v-if="isLoading"> pdf File Loading... </template>
      <vue-pdf-embed
        ref="pdfRef"
        :source="url"
        class="vue-pdf-embed"
        @loaded="handleDocumentLoad"
        @rendered="handleDocumentRender"
        @password-requested="handlePasswordRequest"
        @rendering-failed="handleDocumentRenderFailed"
        @loading-failed="handleDocumentLoadingFailed"
      />
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
</style>
