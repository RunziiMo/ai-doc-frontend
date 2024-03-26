<script lang="ts" setup>
import { ref, computed, watch, watchEffect, nextTick } from "vue";
import { Splitpanes, Pane } from 'splitpanes'
import { ElScrollbar } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue';
import { marked } from 'marked'
import 'splitpanes/dist/splitpanes.css'
import axios from 'axios'

const props = defineProps({
  document: {  
    type: Object,
    required: true,
  },
  content: {  
    type: String,  
    required: true,  
    default: '#Hello, Vue 3!'  
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
    console.log('functions changed from', oldValue, 'to', newValue); 
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
const output = computed(() => {
  return marked(props.content);
});
const prompt = ref("");
const firstSplitter = ref(false);
const loading = ref(false);
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

const docChat = async (prompt) => {
  loading.value = true;
  console.log(prompt);
  const formData = new FormData();  
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
  console.log(api);
  const formData = new FormData();
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
const toast = () => {
  ElMessage.success("Hello");
};
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
}
</script>

<template>
  <splitpanes 
    :first-splitter="false"
    :dbl-click-splitter="false"
    >
    <pane class="flex justify-center" size="65">
      <el-scrollbar v-if="content !== ''">
        <div v-html="output" />
      </el-scrollbar>
      <el-empty v-else description="加载文件失败">
        <el-button @click="$emit('loadDoc')" type="primary">重新加载</el-button>
      </el-empty>
    </pane>
    <pane v-if="showChatter" size="35" class="flex flex-col relative justify-between">
        <div class="hide-scrobar flex flex-col flex-1 items-start overflow-y-scroll"
          ref="scrollContainer"
          style="scrollbar-width: none; -ms-overflow-style: none;">
          <ChatMessage v-for="m in messages" :message="m" :document="document"/>
          <ChatMessage v-for="m in newMessages" :message="m" :document="document"/>
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
  left: -10px;
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