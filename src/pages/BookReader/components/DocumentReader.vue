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

const tag = ref(0)

const editPopovers = ref([])

const isRenderPopover = ref(false)



const markText = () => {
  new Mark(docContainer.value).mark(['中国', '银行'], {
    className: 'text-selected',
    each: (element) => {
      console.log(element)

      element.setAttribute('id', `popoverId${tag.value}`)

      editPopovers.value.push({
        id: `popoverId${tag.value}`,
        el: element,
        show: true
      })
      tag.value++

      element.onclick = function (e) {
        e.stopPropagation()
        e.preventDefault()
        const id = e.target.getAttribute('id')
        editPopovers.value = editPopovers.value.map((item) => {
          if (item.id === id) {
            item.show = !item.show
          }
          return item
        })
        console.log(id)
      }
    },
    done: function () {
      console.log(editPopovers.value, 'marked')
      nextTick(() => {
        isRenderPopover.value = true
      })
    }
  })
}

const { x: mouseX, y: mouseY, isOutside } = useMouseInElement(docContainer.value)

const handleMouseUp = (e) => {
  const selection = window.getSelection()
  console.log(selection)
  let selRange = selection.getRangeAt(0)
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
  console.log(selection, selRange, selectedText, '==selection')
}

const entityInfo = reactive({
  type: '',
  replaced_text: '',
  confidence: ''
})

const handleEdit = (item) => {
  console.log(item)
}
const handleDelete = (item) => {
  console.log(item)
}
const handleAdd = (item) => {
  console.log(item)
}
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
      <div class="flex gap-10px w-100%">
        <el-input placeholder="type" size="small" v-model="entityInfo.type" />
        <el-input v-model="entityInfo.replaced_text" size="small" placeholder="替换文本" />
        <el-input v-model="entityInfo.confidence" size="small" placeholder="置信度" />
      </div>
      <div class="flex w-100% m-t-8px">
        <el-button class="flex-1" type="primary" size="small" @click="handleAdd(item)">
          确定
        </el-button>
      </div>
    </div>
  </Teleport>
  <!-- 编辑弹框 -->
  <template v-if="isRenderPopover">
    <Teleport v-for="item in editPopovers" :to="`#${item.id}`" :key="item.id">
      <div v-show="item.show" class="edit-popover">
        <div class="flex gap-10px w-100%">
          <el-input placeholder="type" size="small" v-model="entityInfo.type" />
          <el-input v-model="entityInfo.replaced_text" size="small" placeholder="替换文本" />
          <el-input v-model="entityInfo.confidence" size="small" placeholder="置信度" />
        </div>
        <div class="flex w-100% m-t-8px">
          <el-button class="flex-1" type="primary" size="small" @click="handleEdit(item)"
            >编辑</el-button
          >
          <el-button class="flex-1" size="small" @click="handleDelete(item)">删除</el-button>
        </div>
      </div>
    </Teleport>
  </template>
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
  z-index: 20;
  padding: 16px;
  cursor: pointer;
  width: 160px;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 9px 28px 8px rgb(0 0 0 / 3%),
    0 6px 16px 4px rgb(0 0 0 / 9%),
    0 3px 6px -2px rgb(0 0 0 / 20%);
  user-select: none;
}
</style>
