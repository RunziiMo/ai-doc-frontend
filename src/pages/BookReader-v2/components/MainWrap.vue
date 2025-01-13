<script lang="ts" setup>
import { ref, computed, nextTick, provide, type PropType, inject, watch, type Ref } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import { ElMessage } from 'element-plus'
import type { BookInfo } from '@/api/types'
import DocumentReader from '@/pages/BookReader/components/DocumentReader.vue'
import DocumentChatter from '@/pages/BookReader/components/DocumentChatter.vue'
import ReferenceDocuments from '@/pages/BookReader/components/ReferenceDocuments.vue'
import EntityApi from '@/api/entity'
import AppApi from '@/api/app'
import type { DocumentInfo } from '@/api/types/document-info'

const props = defineProps({
  bookIdentify: {
    type: String,
    required: true,
  },
  book: {
    type: Object as PropType<BookInfo>,
    required: true,
  },
  docId: {
    type: Number,
    required: true,
  },
})

const showChatter = ref(true)
const currentMessage = ref()
const selectedText = ref('')
const entityList = ref([])
const content = ref('')
// 溯源信息
const traceability = ref({})
const checkedFiles = ref([])
const documentInfo = ref<DocumentInfo>()
const isRetract = ref(false)
const entityTableLoading = ref(true)
// 是否进行的匿名实体识别
const isEntityRecognition = ref(false)

const setEntityRecognitionStore = (val) => {
  isEntityRecognition.value = val
}

const fileName = computed(() => {
  try {
    const context = JSON.parse(currentMessage.value.slots)
    return context?.law?.[0]
  } catch (error) {
    return undefined
  }
})

// 更新并且全量获取实体列表
const getEntityList = async () => {
  try {
    isRetract.value = false
    entityTableLoading.value = true

    const params = {
      book_identify: props.bookIdentify,
      doc_id: props.docId,
    }
    const { data } = await EntityApi.nerUpdate(params)
    entityTableLoading.value = false

    entityList.value = data.data.page.List || []
  } catch (error) {
    console.log(error)
    entityTableLoading.value = false
  }
}

const loadDoc = async () => {
  if (!props.bookIdentify || !props.docId) {
    return
  }
  try {
    const params = {
      identify: props.bookIdentify,
      docId: props.docId,
    }
    const { data } = await AppApi.getDocument(params)
    documentInfo.value = data.data || {}
    content.value = data.data.markdown
    checkedFiles.value = [documentInfo.value.doc_id]
    getEntityList()
  } catch (error) {
    console.log(error)
  }
}

loadDoc()

const handletRaceability = (data) => {
  traceability.value = data || {}
}

const markEntitys = ref()

const handleEntityResults = async (entitys) => {
  if (entitys.length !== 0) {
    await nextTick()
    markEntitys.value()
  } else {
    ElMessage.warning('暂无可标记的实体')
  }
}

const currentSelectDocId = inject<Ref<number>>('currentSelectDocId')
watch(currentSelectDocId, (val) => {
  if (val === props.docId) {
    loadDoc()
  }
})

provide('entityList', entityList)
provide('getEntityList', getEntityList)
provide('isEntityRecognition', isEntityRecognition)
provide('setEntityRecognitionStore', setEntityRecognitionStore)
</script>
<template>
  <splitpanes
    class="w-100% h-100%"
    :first-splitter="false"
    :dbl-click-splitter="false"
    :push-other-panes="false"
  >
    <pane class="flex justify-center h-100%" size="54">
      <DocumentReader
        :bookIdentify="bookIdentify"
        :document="documentInfo"
        :book="book"
        :searchString="selectedText"
        :traceability="traceability"
        v-model:mark-entitys="markEntitys"
        v-model:entity-list="entityList"
        :docId="docId"
      />
    </pane>
    <pane
      v-if="showChatter"
      size="46"
      style="overflow: unset"
      class="flex flex-col items-stretch relative justify-between h-100%"
    >
      <splitpanes class="w-100% h-100%" horizontal>
        <pane style="overflow: unset" class="h-100%">
          <DocumentChatter
            :docId="docId"
            v-model:entity-list="entityList"
            :checked-files="checkedFiles"
            :book="book"
            :bookIdentify="bookIdentify"
            :document="documentInfo"
            :documents="(book as any)?.document_trees || []"
            :entity-table-loading="entityTableLoading"
            :functions="[
              'summary',
              'extract_once_trace',
              'checker_legal',
              'checker_interest',
              'checker_miss',
            ]"
            :is-retract="isRetract"
            :mark-entitys="markEntitys"
            @text-selected="(text) => (selectedText = text)"
            @entity-results="handleEntityResults"
            @get-message="(message) => (currentMessage = message)"
            @traceability="handletRaceability"
            @request-entity-result="() => getEntityList()"
            @retract="isRetract = true"
          />
        </pane>
        <pane v-if="!!fileName" class="h-100%">
          <ReferenceDocuments :search-string="selectedText" :current-message="currentMessage" />
        </pane>
      </splitpanes>
    </pane>
  </splitpanes>
</template>
<style scoped></style>
