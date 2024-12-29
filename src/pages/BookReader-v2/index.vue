<script lang="ts" setup>
import AppApi from '@/api/app'
import { ref, provide } from 'vue'
import type { BookInfo, DocumentTree } from '@/api/types'
import 'splitpanes/dist/splitpanes.css'
import LeftSidebar from '@/components/LeftSidebar.vue'
import UploadFile from '@/pages/BookReader/components/UploadFile.vue'
import DocTag from '@/pages/BookReader/components/DocTag.vue'
import MainWrap from './components/MainWrap.vue'

const currentSelectDocId = ref<number>()
const showChatter = ref(true)
const book = ref<BookInfo>({})
const documentTrees = ref<DocumentTree[]>([])
const document = ref({})
const checkedFiles = ref([])

const docId = ref<number>(0)
const bookIdentify = ref<string>()
const uploadDialogVisible = ref(false)
const docTreeVisible = ref(false)
const isShowSide = ref(true)

const getBook = async () => {
  if (!bookIdentify.value) {
    return
  }
  try {
    const params = {
      identify: bookIdentify.value,
    }
    const { data } = await AppApi.getBook(params)
    book.value = data.data || {};
    documentTrees.value = data.data.document_trees || []
    currentSelectDocId.value = data.data.document_trees?.[0]?.id
    console.log(data)
  } catch (error) {
    console.log(error)
  }
}

const requestData = async () => {
  bookIdentify.value = window.location.pathname.split('/')[2]
  docId.value = Number(window.location.pathname.split('/')[3])
  await getBook()
}

requestData()

function handleBatchAppendTag(data) {
  docTreeVisible.value = false
  book.value.document_trees = data
}

function updateDocId(docIdTmp) {
  console.log(`updateId docId is:${docIdTmp}`)
  docId.value = docIdTmp
  currentSelectDocId.value = docIdTmp
}

function deleteDocId(docIdTmp) {
  console.log(`deleteDocId docId is:${docIdTmp}`)
  book.value.document_trees = book.value.document_trees.filter((item) => item.id !== docIdTmp)
}

provide('currentSelectDocId', currentSelectDocId)
</script>

<template>
  <el-container>
    <el-header class="flex items-center">
      <BaseHeader
        v-model="showChatter"
        :book="book"
        :document="document"
        @hide-side="isShowSide = !isShowSide"
      />
    </el-header>
    <el-container>
      <el-aside v-show="isShowSide" width="260px">
        <!-- 增加“上传文档”和“设置标签” 开始 -->
        <div style="paddingleft: 10px; margintop: 10px">
          <el-button type="success" @click="uploadDialogVisible = !uploadDialogVisible">
            上传文档
          </el-button>
          <!-- <el-button type="primary" @click="docTreeVisible = !docTreeVisible">设置标签</el-button> -->
          <upload-file
            v-model:dialog-visible="uploadDialogVisible"
            :book="book"
            @success="getBook()"
          >
          </upload-file>
          <doc-tag
            v-model:dialog-visible="docTreeVisible"
            :handle-batch-append-tag="handleBatchAppendTag"
            :documents="documentTrees"
          >
          </doc-tag>
        </div>
        <!-- 增加“上传文档”和“设置标签” 结束-->
        <div class="sidebar">
          <LeftSidebar
            v-model:checked-keys="checkedFiles"
            :documents="book.document_trees"
            :book="book"
            @update-doc-id="updateDocId"
            @delete-doc-id="deleteDocId"
          />
        </div>
      </el-aside>
      <el-main>
        <el-tabs class="w-100% h-100%" v-model="currentSelectDocId">
          <el-tab-pane
            class="w-100% h-100%"
            :label="item.text"
            :name="item.id"
            v-for="item in book.document_trees"
            :key="item.id"
          >
            <main-wrap :book="book" :bookIdentify="bookIdentify" :doc-id="item.id" />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
@media print {
  .el-aside {
    display: none;
  }

  .el-container.el-container {
    height: auto;
  }
}

.splitpanes__splitter {
  margin-right: 10px;
  margin-left: 10px;
  position: relative;
  background-color: #909399;
}

.splitpanes__splitter:before {
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: #909399;
  opacity: 0;
  z-index: 1;
}

.splitpanes__splitter:hover:before {
  opacity: 1;
}

.splitpanes--vertical > .splitpanes__splitter:before {
  left: -10px;
  right: -10px;
  height: 100%;
}

.splitpanes--horizontal > .splitpanes__splitter:before {
  top: -10px;
  bottom: -10px;
  width: 100%;
}

.app-body {
  display: flex;
}

.sidebar {
  background-color: #f9f9f9;
  /* 侧边栏背景色 */
  border-right: 1px solid #eee;
  /* 可选的右侧边框 */
  padding: 10px;
  /* 内边距 */
}

:deep(.el-tabs) > .el-tabs__header {
  display: none;
}

:deep(.el-tabs) > .el-tabs__content {
  height: 100%;
}
</style>
