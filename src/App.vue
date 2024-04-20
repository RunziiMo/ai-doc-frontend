<script setup>
import { ElMessage } from 'element-plus'
import { ref, onMounted, watch, watchEffect } from 'vue'
import axios from 'axios'
import {
  Check,
  Delete,
  Edit,
  Message,
  ArrowRightBold,
  Search,
  Star,
} from '@element-plus/icons-vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import LeftSidebar from './components/LeftSidebar.vue';

const showChatter = ref(true)
const book = ref({});
const document = ref({});
const content = ref("");
const functions = ref([]);
const selectedText = ref("");

const docId = ref(0);
const bookIdentify = ref("")

const loadDoc = async (bookIdentify, docId) => {
    if (docId === undefined) {
        docId = 0;
    }
    let response = await axios.get(`/api/${bookIdentify}/content/${docId}`); 
    console.log("document response:");
    console.log(response);
    if (response.data.errcode !== 0) {
        ElMessage(response.data.message);
    } else {
        var data = response.data.data;
        document.value = data;
        content.value = data.markdown;
    }
};

watchEffect(async () => {
    if (bookIdentify.value === "" || docId.value === ""){
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
        ElMessage(bookResponse.data.message);
    } else {
        book.value = bookResponse.data.data;
        functions.value = book.value.aigc_function.split(';');
    }
})

onMounted(async () => {
    bookIdentify.value = window.location.pathname.split('/')[2];
    docId.value = window.location.pathname.split('/')[3];
})

function updateDocId(docIdTmp) {
    console.log(`updateId docId is:${docIdTmp}`);
    docId.value = docIdTmp;
}
</script>

<template>
    <el-container>
        <el-header>      
            <BaseHeader v-model="showChatter"
              :book="book"
              :document="document"
              />
        </el-header>
        <el-container>
            <el-aside width="300px">
                <div class="sidebar">
                    <LeftSidebar
                        :documents="book.document_trees"
                        :book="book"
                        @update-doc-id="updateDocId"
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
                            :functions="functions"
                            :searchString="selectedText"
                        />
                    </pane>
                    <pane v-if="showChatter" size="35" class="flex flex-col relative justify-between">
                        <DocumentChatter
                            :bookIdentify="bookIdentify"
                            :document="document"
                            :functions="functions"
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
