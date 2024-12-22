<script setup>
import { ref, computed, inject, nextTick } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import axios from 'axios'
import DocumentReader from '@/pages/BookReader/components/DocumentReader.vue'
import DocumentChatter from '@/pages/BookReader/components/DocumentChatter.vue'
import ReferenceDocuments from '@/pages/BookReader/components/ReferenceDocuments.vue'

const props = defineProps({
  bookIdentify: {
    type: String,
    required: true
  },
  book: {
    type: Object,
    required: true
  }
})

const showChatter = ref(true)
const currentMessage = ref()
const selectedText = ref('')
const markEntitys = ref()
const entityList = ref([])
const content = ref('')
// 溯源信息
const traceability = ref({})
const checkedFiles = ref([])
const documentInfo = ref({})
const isRetract = ref(false)
const entityTableLoading = ref(true)

const currentSelectDocId = inject('currentSelectDocId')

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
    const formData = new FormData()
    formData.append('book_identify', props.bookIdentify)
    formData.append('doc_id', documentInfo.value.doc_id)
    const { data } = await axios.post(`/aigc/ner_update`, formData)
    entityTableLoading.value = false
    if (data.errcode !== 0) {
      entityList.value = []
    } else {
      entityList.value = data.data.page.List || []
    }
  } catch (error) {
    console.log(error)
    entityTableLoading.value = false
  }
}

const loadDoc = async () => {
  if (!props.bookIdentify || !currentSelectDocId.value) {
    return
  }
  try {
    const response = await axios.get(
      `/api/${props.bookIdentify}/content/${currentSelectDocId.value}`
    )
    if (response.data.errcode !== 0) {
      ElMessage.warning(response.data.message)
    } else {
      var data = response.data.data
      console.log('document:', data)
      documentInfo.value = data
      content.value = data.markdown
      checkedFiles.value = [documentInfo.value.doc_id]
      getEntityList(documentInfo.value.doc_id)
    }
  } catch (error) {
    console.log(error)
  }
}

loadDoc()

const handletRaceability = (data) => {
  traceability.value = data || {}
}

const handleEntityResults = async (entitys) => {
  if (entitys.length !== 0) {
    await nextTick()
    markEntitys.value(entitys)
  } else {
    ElMessage.warning('暂无可标记的实体')
  }
}
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
            v-model:entity-list="entityList"
            :checked-files="checkedFiles"
            :bookIdentify="bookIdentify"
            :document="documentInfo"
            :documents="book.document_trees"
            :entity-table-loading="entityTableLoading"
            :functions="[
              'summary',
              'extract_once_trace',
              'checker_legal',
              'checker_interest',
              'checker_miss'
            ]"
            :is-retract="isRetract"
            @text-selected="(text) => (selectedText = text)"
            @entity-results="handleEntityResults"
            @get-message="(message) => (currentMessage = message)"
            @traceability="handletRaceability"
            @request-entity-result="() => getEntityList(documentInfo.doc_id)"
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
