<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from "vue"
import { ElScrollbar } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import axios from 'axios'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'

const props = defineProps({
    bookIdentify: {
        type: String,
        required: true,
    },
    document: {  
        type: Object,
        required: true,
    },
    functions: {
        type: Array,
        required: true
    }
});

onMounted(async () => {
    if (props.document.doc_id) {
        loadChatMessages(props.document.doc_id);
    }
})

watch(
    () => props.document,
    (newValue, oldValue) => {
        loadChatMessages(newValue.doc_id);
    }
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
const loading = ref(false);
const messages = ref([]);
watch(
    () => messages,
    (newValue, oldValue) => {
        console.log("messages changed");
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
        ElMessage.warning(response.data.message);
    } else {
        const data = response.data.data;
        messages.value = data.page.List
        console.log("messages", data);
    }
};

const docChat = async (prompt) => {
    loading.value = true;
    console.log(prompt);
    const formData = new FormData();
    formData.append('book_identify', props.bookIdentify);
    formData.append('doc_id', props.document.doc_id);
    formData.append('prompt', prompt);
    let chatResponse = await axios.post('/aigc/chat', formData);
    let response = chatResponse.data;
    if (response.errcode !== 0) {
        ElMessage.warning(response.message);
    } else {
        messages.value.push(response.data);
        scrollToBottom();
    }
    loading.value = false;
};
const docAnalyze = async (api) => {
    loading.value = true;
    const formData = new FormData();
    formData.append('book_identify', props.bookIdentify);
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
        messages.value.push(response.data);
        scrollToBottom();
    }
    loading.value = false;
};
const scrollToBottom = () => {
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
      }
    });
}
const emit = defineEmits(['textSelected']);
</script>

<template>
    <div class="hide-scrobar flex flex-col flex-1 items-start overflow-y-scroll"
        ref="scrollContainer"
        style="scrollbar-width: none; -ms-overflow-style: none;">
        <ChatMessage 
            v-for="m in messages" :message="m"
            @text-selected="(text) => $emit('textSelected', text)"
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
</template>

<style>
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
</style>