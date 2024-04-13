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
import LeftSidebar from './components/LeftSidebar.vue';

const showChatter = ref(true)
const book = ref({});
const document = ref({});
const content = ref("");
const functions = ref([]);

const docId = ref(0);
const bookIdentify = ref("")

const loadDoc = async (bookIdentify, docId) => {
  if (docId === undefined) {
    docId = 0;
  }
  let response = await axios.get(`/api/${bookIdentify}/content/${docId}`); 
  console.log(bookIdentify);
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
  // console.log(`docId newValue is ${newValue}`)
  // console.log(`docId oldValue is ${oldValue}`)
  console.log("watchEffect:")
  console.log(`bookIdentify is ${bookIdentify.value}`)
  console.log(`docId is ${docId.value}`)

  if (bookIdentify.value === "" || docId.value === ""){
    return
  }
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
  // console.log("onMounted, bookIdentify", bookIdentify)
  // console.log("onMounted, docId", docId.value)
  // await loadDoc(bookIdentify, docId.value);
  // let params = {
  //   identify: bookIdentify,  
  // };
  // const bookResponse = await axios.get(`/api/book/${bookIdentify}`, { params }); 
  // console.log("bookResponse:");
  // console.log(bookResponse);
  // if (bookResponse.data.errcode !== 0) {
  //   ElMessage(bookResponse.data.message);
  // } else {
  //   book.value = bookResponse.data.data;
  //   functions.value = book.value.aigc_function.split(';');
  // }
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
    <el-main>
      <div class="app-body">
        <div class="sidebar">
          <LeftSidebar
              :documents="book.document_trees"
              :book="book"
              @update-doc-id="updateDocId"
          />
        </div>
        <DocumentReader
            :book="book"
            :document="document"
            :functions="functions"
            :showChatter="showChatter"
            @load-doc="loadDoc"
        />
      </div>
    </el-main>
  </el-container>
</template>

<style>
/* 全局样式，确保 html 和 body 的高度为 100% */  
html, body {  
  margin: 0;  
  padding: 0;  
}

.el-container {
  height: 100vh;
}

.el-header {
  display: flex;
  align-items: center;
}

/* 设置 el-main 为 flex-grow: 1，使其填充剩余空间 */  
.el-main {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
  padding-top: 0;
  padding-bottom: 0;
}

.app-body {  
  display: flex;
}
.sidebar {
  width: 300px; /* 侧边栏宽度 */  
  background-color: #f9f9f9; /* 侧边栏背景色 */  
  border-right: 1px solid #eee; /* 可选的右侧边框 */  
  padding: 10px; /* 内边距 */  
}
</style>
