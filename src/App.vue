<script setup>
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
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

const showChatter = ref(true)
const book = ref({});
const document = ref({});
const content = ref("");
const functions = ref([]);

const loadDoc = async (bookIdentify) => {
  let response = await axios.get(`/api/${bookIdentify}/content`); 
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

onMounted(async () => {
    const bookIdentify = window.location.pathname.split('/').pop();
    await loadDoc(bookIdentify);
    const params = {
        identify: bookIdentify,  
    };
    const bookResponse = await axios.get(`/api/book/${bookIdentify}`, { params }); 
    console.log(bookResponse);
    if (bookResponse.data.errcode !== 0) {
        ElMessage(bookResponse.data.message);
    } else {
        book.value = bookResponse.data.data;
        functions.value = book.value.aigc_function.split(';');
    }
})
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
      <DocumentReader
          :book="book"
          :document="document"
          :functions="functions"
          :showChatter="showChatter"
          @load-doc="loadDoc"
      />
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
</style>
