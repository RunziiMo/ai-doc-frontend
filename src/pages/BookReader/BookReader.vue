<script setup>
import { ElMessage } from 'element-plus'
import { ref, onMounted, watch, watchEffect, provide } from 'vue'
import axios from 'axios'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import LeftSidebar from '../../components/LeftSidebar.vue';

import UploadFile from './components/UploadFile.vue';
import DocTag from './components/DocTag.vue';
import DocumentReader from './components/DocumentReader.vue'
import DocumentChatter from './components/DocumentChatter.vue'

const showChatter = ref(true)
const book = ref({
    'document_trees': []
});
const document = ref({});
const content = ref("");
const selectedText = ref("");

const docId = ref(0);
const bookIdentify = ref("")
const uploadDialogVisible = ref(false)
const docTreeVisible = ref(false)
const isShowSide = ref(true)

const loadDoc = async (bookIdentify, docId) => {
    if (docId === undefined) {
        docId = 0;
    }
    let response = await axios.get(`/api/${bookIdentify}/content/${docId}`);
    console.log("document response:");
    console.log(response);
    if (response.data.errcode !== 0) {
        ElMessage.warning(response.data.message);
    } else {
        var data = response.data.data;
        document.value = data;
        content.value = data.markdown;
    }
};

const getBook = async () => {
    if (bookIdentify.value === "" || docId.value === "") {
        return
    }
    console.log("watchEffect:")
    console.log(`bookIdentify is ${bookIdentify.value}`)
    console.log(`docId is ${docId.value}`)
    await loadDoc(bookIdentify.value, docId.value);
    let params = {
        identify: bookIdentify.value,
    };
    const bookResponse = await axios.get(`/api/book/${bookIdentify.value}`, { params });
    console.log("bookResponse:");
    console.log(bookResponse);

    if (bookResponse.data.errcode !== 0) {
        ElMessage.warning(bookResponse.data.message);
    } else {
        book.value = bookResponse.data.data;
    }
}

onMounted(async () => {
    bookIdentify.value = window.location.pathname.split('/')[2];
    docId.value = window.location.pathname.split('/')[3];
    await getBook();
})

function handleBatchAppendTag(data) {
    console.log('add-tree-tag')
    docTreeVisible.value = false;
    book.value.document_trees = data;
}

function updateDocId(docIdTmp) {
    console.log(`updateId docId is:${docIdTmp}`);
    docId.value = docIdTmp;
    getBook();
}

function deleteDocId(docIdTmp) {
    console.log(`deleteDocId docId is:${docIdTmp}`);
    book.value.document_trees = book.value.document_trees.filter(item => item.id !== docIdTmp);  
}
</script>

<template>
    <el-container>
        <el-header>      
            <BaseHeader v-model="showChatter"
              :book="book"
              :document="document"
              @hide-side="isShowSide = !isShowSide"
              />
        </el-header>
        <el-container>
            <el-aside v-show="isShowSide" width="300px">
                <!-- 增加“上传文档”和“设置标签” 开始 -->
                <div style="paddingLeft: 10px;marginTop: 10px;">
                    <el-button type="success" @click="uploadDialogVisible = !uploadDialogVisible">上传文档</el-button>
                    <!-- <el-button type="primary" @click="docTreeVisible = !docTreeVisible">设置标签</el-button> -->
                    <upload-file
                        v-model:dialog-visible="uploadDialogVisible"
                        :book="book"  @success="getBook()">
                    </upload-file>
                    <doc-tag
                        v-model:dialog-visible="docTreeVisible"
                        :handle-batch-append-tag="handleBatchAppendTag"
                        :documents="book.document_trees">
                    </doc-tag>
                </div>
                <!-- 增加“上传文档”和“设置标签” 结束-->
                <div class="sidebar">
                    <LeftSidebar
                        :documents="book.document_trees"
                        :book="book"
                        @update-doc-id="updateDocId"
                        @delete-doc-id="deleteDocId"
                    />
                </div>
            </el-aside>
            <el-main>
                <splitpanes 
                    :first-splitter="false"
                    :dbl-click-splitter="false"
                    :push-other-panes="false"
                >
                    <pane class="flex justify-center" size="65">
                        <DocumentReader
                            :bookIdentify="bookIdentify"
                            :document="document"
                            :searchString="selectedText"
                        />
                    </pane>
                    <pane v-if="showChatter" size="35" class="flex flex-col items-stretch relative justify-between">
                        <DocumentChatter
                            :bookIdentify="bookIdentify"
                            :document="document"
                            :functions="['summary','extract_once_trace','checker_legal','checker_interest','checker_miss']"
                            @text-selected="(text) => selectedText = text"
                        />
                    </pane>
                </splitpanes>
            </el-main>
        </el-container>
    </el-container>
</template>

<style>
/* 全局样式，确保 html 和 body 的高度为 100% */  
html, body {
    margin: 0;
    padding: 0;
}

.el-header {
    display: flex;
    align-items: center;
}

.el-container.el-container {
    height: calc(100vh - 60px);
}

/* 设置 el-main 为 flex-grow: 1，使其填充剩余空间 */
.el-main {
    padding-top: 0;
    padding-bottom: 0;
}

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
.splitpanes__splitter:hover:before {opacity: 1;}
.splitpanes--vertical > .splitpanes__splitter:before {left: -10px;right: -10px;height: 100%;}
.splitpanes--horizontal > .splitpanes__splitter:before {top: -10px;bottom: -10px;width: 100%;}

.app-body {
    display: flex;
}
.sidebar {
    background-color: #f9f9f9; /* 侧边栏背景色 */  
    border-right: 1px solid #eee; /* 可选的右侧边框 */  
    padding: 10px; /* 内边距 */  
}
</style>
