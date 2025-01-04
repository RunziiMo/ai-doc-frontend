<script lang="ts" setup>
import { ref, computed, watch, reactive, inject, type Ref } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import { ElMessageBox, ElScrollbar } from 'element-plus'
import 'splitpanes/dist/splitpanes.css'
import axios from 'axios'
import { defaultOptions, renderAsync } from 'docx-preview'
import Mark from 'mark.js'
import { ElMessage } from 'element-plus'
import PdfView from './PdfView.vue'
import useTypes from './use-types'
import type { Entity } from '@/api/types'

const props = defineProps({
  bookIdentify: {
    type: String,
    required: true,
  },
  document: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  searchString: {
    type: String,
    required: true,
  },
  traceability: {
    type: Object,
    required: true,
  },
  book: {
    type: Object,
    required: true,
  },
})

const currentSelectDocId = inject<Ref<number>>('currentSelectDocId')

const emit = defineEmits(['fileRenderFinished', 'refreshEntity'])

const isPdf = computed(() => {
  return props.document?.identify?.endsWith('.pdf')
})

const addPopover = ref({
  visible: false,
  top: 0,
  left: 0,
})

const loadDocument = async (bookIdentify, docId) => {
  const url = `/api/book/${bookIdentify}/download/${docId}`
  let response = await axios.get(url, {
    responseType: 'blob', // 设置响应类型为 blob
  })
  const docxOptions = Object.assign(defaultOptions, {
    inWrapper: false,
    ignoreWidth: true,
    experimental: true,
  })
  await renderAsync(response.data, docContainer.value, null, docxOptions).finally(() => {
    handleRendered()
  })
}

watch(
  () => props.document,
  (newValue) => {
    if (isPdf.value) return
    loadDocument(props.bookIdentify, newValue.doc_id)
  },
)

watch(
  () => props.searchString,
  (newValue) => {
    scrollToText(newValue)
  },
)

watch(
  () => props.traceability,
  (newValue) => {
    scrollToText(newValue.entityName, newValue.entityIndex)
  },
)
const docContainer = ref<HTMLDivElement>(null)

const addPopoverRef = ref()

const editEntitysModel = reactive({
  type: '',
  replaced_text: '',
  confidence: '',
  entity_id: 0,
  start_index: 0,
  end_index: 0,
})

const editPopover = ref({
  visible: false,
  top: 0,
  left: 0,
})

watch(currentSelectDocId, () => {
  addPopover.value.visible = false
  editPopover.value.visible = false
})

const disabledEditEntity = ref(true)

const markEntitys = defineModel('markEntitys', {
  type: Function,
  default: () => {},
})

const { typeList, colors } = useTypes(props.book.item_name)

const handelMark = (instance, entitys) => {
  const options = (data) => ({
    acrossElements: true,
    separateWordSearch: false,
    diacritics: false,
    className: `text-selected entity-${data.entity_id}`,
    each: (element) => {
      element.style.setProperty('--background-color', colors[data.type])
      element.setAttribute('id', data.entity_id)
      element.onmouseenter = function () {
        Object.assign(editEntitysModel, data)
        const { left, bottom } = element.getBoundingClientRect()
        editPopover.value.top = bottom
        editPopover.value.left = left
        editPopover.value.visible = true
      }
    },
    done: async function () {},
  })

  const num = entitys.length
  let operationIndex = 0
  function performDOMOperations() {
    const operationsPerFrame = 5 // 每次执行5个标记操作作为一个分片
    const endIndex = Math.min(operationIndex + operationsPerFrame, num)
    for (let i = operationIndex; i < endIndex; i++) {
      const el = entitys[i]
      instance.mark(el.replaced_text, options(el))
    }
    operationIndex = endIndex
    if (operationIndex < num) {
      requestAnimationFrame(performDOMOperations)
    }
  }

  requestAnimationFrame(performDOMOperations)
  // entitys?.forEach((el) => {
  //   const texts = el.window_text.split(el.replaced_text)
  //   const regexStr = `(?<=${texts[0]})${el.replaced_text}(?=${texts[1]})`
  //   const regex = new RegExp(regexStr, 'gim')
  //   instance.markRegExp(regex, options(el))
  // })
}

markEntitys.value = async () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target

        const textContent = el.textContent
        const currentDomEntitys = entityList.value.filter(
          (el, index) =>
            textContent.includes(el.replaced_text) &&
            index === entityList.value.findIndex((el2) => el2.replaced_text === el.replaced_text),
        )
        // 在这里进行标记操作
        if (currentDomEntitys.length === 0) return

        const instance = new Mark(el)
        handelMark(instance, currentDomEntitys)

        observer.unobserve(el)
      }
    })
  })
  Array.from(docContainer.value.getElementsByTagName('article')).forEach((article) => {
    Array.from(article.children).forEach((element) => {
      observer.observe(element)
    })
  })
}

const { x: mouseX, y: mouseY, isOutside } = useMouseInElement(docContainer.value)
const { isOutside: isAddPopoverOutside } = useMouseInElement(addPopoverRef.value)

const addEntitysModel = reactive({
  type: '',
  confidence: 1,
  start_index: 0,
  end_index: 0,
  window_text: '',
  replaced_text: '',
})

const handleMouseUp = () => {
  const selection = window.getSelection()
  const selectedText = selection.toString()
  if (selectedText) {
    if (!isOutside.value) {
      editPopover.value.visible = false
      addPopover.value = {
        visible: true,
        top: mouseY.value,
        left: mouseX.value,
      }
      addEntitysModel.replaced_text = selectedText
    }
  }
  if (isAddPopoverOutside.value) {
    addPopover.value.visible = false
  }
}

const entityList = inject<Ref<Array<Entity>>>('entityList')
const getEntityList = inject<Function>('getEntityList')

// const getEntityListByApi = async () => {
//   const { data } = await axios.get(`/api/document/${props.document?.doc_id}/entity`)
//   if (data.errcode !== 0) {
//     entityList.value = []
//   } else {
//     entityList.value = data.data.page.List || []
//     await nextTick() // 等待DOM更新
//     markEntitys.value(entityList.value)
//   }
// }

// const getEntityList = async (data) => {
//   if (data.errcode !== 0) {
//     entityList.value = []
//   } else {
//     entityList.value = data.data.page.List || []
//     await nextTick() // 等待DOM更新
//     markEntitys.value?.(entityList.value)
//   }
// }

const handleRendered = async () => {
  await getEntityList()
  if (entityList.value.length !== 0) {
    markEntitys.value?.()
  }
  emit('fileRenderFinished')
}

const scrollToText = async (searchString, index = 0) => {
  const markIns = new Mark(docContainer.value)

  // await nextTick() // 等待DOM更新
  const elements = docContainer.value.getElementsByTagName('mark') // 假设被高亮的文本被<mark>标签包裹
  const targetMarks = Array.from(elements).filter(
    (el) => searchString.startsWith(el.textContent) && el.parentElement.tagName !== 'MARK',
  )
  let firstElement = targetMarks?.[index]
  if (elements.length > 0) {
    if (firstElement) {
      firstElement.scrollIntoView({ behavior: 'smooth' })
      markIns.mark(searchString, {
        acrossElements: true,
        className: 'text-scroll-selected',
      })
    }
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

const objToFormData = (obj) => {
  const formData = new FormData()

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      formData.append(key, obj[key])
    }
  }

  return formData
}

const handleEdit = async () => {
  const form = objToFormData(editEntitysModel)
  const response = await axios.put(
    `/api/document/${props.document?.doc_id}/entity/${editEntitysModel.entity_id}`,
    form,
  )
  const { errcode, message } = response.data
  if (errcode === 0) {
    ElMessage.success(message)
    await getEntityList()
    markEntitys.value?.()
    editPopover.value.visible = false
    disabledEditEntity.value = true
  } else {
    // 表单提交失败，处理错误
    ElMessage.warning(message)
  }
}
const handleDelete = async () => {
  const entityInfo = entityList.value.find((el) => {
    return el.entity_id === editEntitysModel.entity_id
  })
  const entityIds = entityList.value
    .filter((el) => {
      return el.replaced_text === entityInfo.replaced_text
    })
    .map((el) => el.entity_id)
  if (entityIds.length > 1) {
    await ElMessageBox.confirm(
      `当前文章共有${entityIds.length}个相同实体，确定后将全部删除，确定删除吗?`,
      'Warning',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  }

  await ElMessageBox.confirm('确定要删除吗?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  const response = await axios.delete(
    `/api/document/${props.document?.doc_id}/entity?&type=${entityInfo.type}&text=${encodeURIComponent(entityInfo.replaced_text)}`,
  )
  const { errcode, message } = response.data
  if (errcode === 0) {
    ElMessage.success(message)
    await getEntityList()
    const instance = new Mark(
      document.getElementById(`file-render-container-${props.document.doc_id}`),
    )
    entityIds.forEach((el) => {
      instance.unmark({
        className: `entity-${el}`,
      })
    })
    editPopover.value.visible = false
  } else {
    // 表单提交失败，处理错误
    ElMessage.warning(message)
  }
}

const handleAdd = async () => {
  const text = document.getElementById(`file-render-container-${props.document.doc_id}`).textContent
  const num = text.match(new RegExp(addEntitysModel.replaced_text, 'g'))?.length
  if (num > 1) {
    await ElMessageBox.confirm(
      `当前文章共有${num}个相同实体，确定后将全部添加，确定添加吗?`,
      'Warning',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  }
  const response = await axios.post(
    `/api/document/${props.document?.doc_id}/entity`,
    addEntitysModel,
  )
  const { errcode, message } = response.data
  if (errcode === 0) {
    ElMessage.success(message)
    await getEntityList()
    markEntitys.value?.()
    addPopover.value.visible = false
  } else {
    // 表单提交失败，处理错误
    ElMessage.warning(message)
  }
}

const handleCancle = () => {
  const type = entityList.value.find((el) => el.entity_id === editEntitysModel.entity_id).type
  Object.assign(editEntitysModel, {
    ...editEntitysModel,
    type,
  })
  editPopover.value.visible = false
  disabledEditEntity.value = true
}
</script>

<template>
  <el-scrollbar
    v-if="isPdf"
    @scroll="() => ((addPopover.visible = false), (editPopover.visible = false))"
  >
    <div
      ref="docContainer"
      :id="`file-render-container-${document?.doc_id}`"
      class="wh-full"
      @mouseup.stop="handleMouseUp"
    >
      <PdfView :url="url" @rendered="handleRendered" />
    </div>
  </el-scrollbar>
  <el-scrollbar
    v-else-if="isDocx"
    @scroll="() => ((addPopover.visible = false), (editPopover.visible = false))"
  >
    <div
      ref="docContainer"
      :id="`file-render-container-${document?.doc_id}`"
      class="wh-full"
      @mouseup.stop="handleMouseUp"
    />
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
      @mouseup.stop
    >
      <el-form :model="addEntitysModel" class="flex gap-10px w-100%" inline>
        <el-form-item class="!m-r-0 !m-b-0 !w-100%" label="类别">
          <el-select
            placeholder="type"
            size="small"
            class="!w-100%"
            :teleported="false"
            v-model="addEntitysModel.type"
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item class="!m-r-0 !m-b-0" label="置信度">
          <el-input
            v-model="addEntitysModel.confidence"
            size="small"
            class="!w-60px"
            disabled
            placeholder="置信度"
          />
        </el-form-item> -->
      </el-form>
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
      <el-form :model="editEntitysModel" class="flex gap-10px w-100%" inline>
        <el-form-item class="!m-r-0 !m-b-0 !w-100%" label="类别">
          <el-select
            placeholder="type"
            size="small"
            class="!w-100%"
            :teleported="false"
            :disabled="disabledEditEntity"
            v-model="editEntitysModel.type"
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item class="!m-r-0 !m-b-0" label="置信度">
          <el-input
            v-model="editEntitysModel.confidence"
            size="small"
            class="!w-60px"
            disabled
            placeholder="置信度"
          />
        </el-form-item> -->
      </el-form>
      <div class="flex w-100% m-t-8px">
        <template v-if="disabledEditEntity">
          <el-button
            class="flex-1"
            type="primary"
            size="small"
            @click="disabledEditEntity = false"
            @mouseenter.prevent
            @mouseleave.prevent
          >
            编辑
          </el-button>
          <el-button
            class="flex-1"
            size="small"
            @click="handleDelete"
            @mouseenter.prevent
            @mouseleave.prevent
          >
            删除
          </el-button>
        </template>

        <template v-else>
          <el-button class="flex-1" type="primary" size="small" @click="handleEdit">
            确定
          </el-button>
          <el-button class="flex-1" type="primary" size="small" @click="handleCancle">
            取消
          </el-button>
        </template>
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

:deep(mark) {
  cursor: pointer;
  position: relative;
  user-select: none;
  background: var(--background-color);
}
:deep(.text-scroll-selected) {
  --background-color: rgb(255, 166, 0) !important;
  background: var(--background-color) !important;
}
:deep(.text-scroll-selected mark) {
  --background-color: rgb(255, 166, 0) !important;
  background: var(--background-color) !important;
}

:deep(.edit-popover) {
  left: 0;
}
</style>
<style scoped>
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
  -webkit-user-select: none !important;
  /* Chrome, Safari, Opera */
  -moz-user-select: none !important;
  /* Firefox */
  -ms-user-select: none !important;
  /* Internet Explorer/Edge */
  user-select: none !important;
}

.edit-popover .el-button--primary span {
  color: #fff !important;
}

.edit-popover .el-select {
  text-indent: 0pt !important;
}
</style>
