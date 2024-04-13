<script lang="ts" setup>
import { ref, computed, watch, watchEffect, nextTick } from "vue"
import { Splitpanes, Pane } from 'splitpanes'
import { ElScrollbar } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import { marked } from 'marked'
import 'splitpanes/dist/splitpanes.css'
import axios from 'axios'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import { defaultOptions, renderAsync } from 'docx-preview'
import Mark from 'mark.js'

const props = defineProps({
    book: {  
        type: Object,
        required: true,
    },
    document: {  
        type: Object,
        required: true,
    },
    functions: {
        type: Array,
        required: true
    },
    showChatter: {  
        type: Boolean,  
        default: true
    },
    messages: {
        type: Array
    }
});

watch(
    () => props.document,
    (newValue, oldValue) => {
        const bookIdentify = window.location.pathname.split('/').pop();
        loadDocument(bookIdentify, newValue.doc_id)
        loadChatMessages(newValue.doc_id);
    }
);
watch(
    () => props.messages,
    (newValue, oldValue) => {
        console.log("messages changed");
        scrollToBottom();
    },
    {deep: true}
);
watch(
    () => props.functions,
    (newValue, oldValue) => {
        console.log("functions changed");
        scrollToBottom();
    },
    {deep: true}
);

const prompt = ref("");
const firstSplitter = ref(false);
const loading = ref(false);
const searchString = ref("");
watch(
    () => searchString.value,
    (newValue, oldValue) => {
        scrollToText(newValue);
    }
);
const newMessages = ref([]);
watch(
  () => newMessages,
  (newValue, oldValue) => {
    console.log("newMessages changed");
    scrollToBottom();
  },
  {deep: true}
);
const scrollContainer = ref<HTMLDivElement>();
const docxContainer = ref<HTMLDivElement>();

const loadChatMessages = async (documentId) => {
  const params = {
    doc_id: documentId,
    page: -1,
  }
  let response = await axios.get("/api/aigc/messages", { params }); 
  if (response.data.errcode !== 0) {
    ElMessage(response.data.message);
  } else {
    let data = response.data.data;
    props.messages = data.page.List
    console.log("messages", data);
  }
};
const loadDocument = async (bookIdentify, documentId) => {
    const url = `/api/book/${bookIdentify}/download/${documentId}`
    let response = await axios.get(url, {  
        responseType: 'blob' // 设置响应类型为 blob  
    });
    const docxOptions = Object.assign(defaultOptions, {
        inWrapper: false,
        ignoreWidth: true,
        experimental: true
    })
    await renderAsync(response.data, docxContainer.value, null, docxOptions)
};

const docChat = async (prompt) => {
    loading.value = true;
    console.log(prompt);
    const formData = new FormData();
    formData.append('book_identify', props.book.identify);
    formData.append('doc_id', props.document.doc_id);
    formData.append('prompt', prompt);
    let chatResponse = await axios.post('/aigc/chat', formData);
    let response = chatResponse.data;
    if (response.errcode !== 0) {
        ElMessage({
            message: response.message,
            type: 'warning',
        });
    } else {
        newMessages.value.push(response.data);
        scrollToBottom();
    }
    loading.value = false;
};
const docAnalyze = async (api) => {
    loading.value = true;
    const formData = new FormData();
    formData.append('book_identify', props.book.identify);
    formData.append('doc_id', props.document.doc_id);
    formData.append('api', api);
    let chatResponse = await axios.post('/aigc/analyze', formData);
    let response = chatResponse.data;
    if (response.errcode !== 0) {
        ElMessage({
            message: response.message,
            type: 'warning',
        });
    } else {
        newMessages.value.push(response.data);
        scrollToBottom();
    }
    loading.value = false;
};
const toast = (message) => {
    ElMessage.warning(message);
};
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
}
const scrollToText = async (searchString) => {
    new Mark(docxContainer.value).unmark().mark(searchString, {
        "acrossElements": true,
        "accuracy": "partially"
    });
    await nextTick(); // 等待DOM更新
    const elements = docxContainer.value.querySelectorAll("mark"); // 假设被高亮的文本被<mark>标签包裹  
    if (elements.length > 0) {
        const firstElement = elements[0];
        firstElement.scrollIntoView({ behavior: 'smooth' });
        // 如果使用<el-scrollbar>，则可能需要使用其API来滚动  
        // scrollbar.value?.scrollToElement(firstElement); // 假设Element Plus提供了这样的API  
    } else {
        ElMessage.warning("原文未找到【" + searchString + "】");
    }
}
</script>

<template>
  <splitpanes 
    :first-splitter="false"
    :dbl-click-splitter="false"
    >
    <pane class="flex justify-center" size="65">
        <!--vue-office-docx
            v-if="book.identify && document.doc_id"
            :src="`/api/book/${book.identify}/download/${document.doc_id}`"
            @error="toast('加载文档失败')"
        /-->
        <el-scrollbar v-if="book.identify && document.doc_id">
            <div ref="docxContainer" />
        </el-scrollbar>
        <el-empty v-else-if="document.markdown !== undefined && document.markdown === ''" description="空白文档">
        </el-empty>
        <el-skeleton v-else :rows="20" animated />
    </pane>
    <pane v-if="showChatter" size="35" class="flex flex-col relative justify-between">
        <div class="hide-scrobar flex flex-col flex-1 items-start overflow-y-scroll"
            ref="scrollContainer"
            style="scrollbar-width: none; -ms-overflow-style: none;">
            <ChatMessage
                v-for="m in messages" :message="m"
                @text-selected="scrollToText"
            />
            <ChatMessage 
                v-for="m in newMessages" :message="m"
                @text-selected="scrollToText"
            />
        </div>
        <div>
            <el-button
                v-for="func in functions"
                class="mt-3" type="success" :icon="Promotion"
                @click="docAnalyze(func)"
                round>
                {{ func }}
            </el-button>
            <div class="flex my-3">
                <el-input v-model="prompt" placeholder="请输入问题" />
                <el-button @click="docChat(prompt)" :loading="loading" class="ml-3" type="success" :icon="Promotion" />
            </div>
        </div>
    </pane>
  </splitpanes>
</template>

<style>
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
</style>