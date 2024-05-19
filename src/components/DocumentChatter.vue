<script lang="ts" setup>
import { reactive, ref, computed, watch, onMounted, nextTick } from "vue"
import { ElMessage, ElScrollbar } from 'element-plus'
import { Promotion } from '@element-plus/icons-vue'
import axios from 'axios'

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
        required: true,
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
    async (newValue, oldValue) => {
        await nextTick();
        scrollToBottom();
    },
    {deep: true}
);

const role = ref("");
const prompt = ref("");
const loading = ref(false);
const messages = ref([]);
watch(
    () => messages,
    async (newValue, oldValue) => {
        await nextTick();
        console.log("messages changed");
        scrollToBottom();
    },
    {deep: true}
);
const scrollContainer = ref<HTMLDivElement>();

const querySearch = (queryString: string, cb: any) => {
    if (!queryString.startsWith("/")) {
        cb([]);
        return;
    }
    // 如果是，使用 substring 方法删除第一个斜杠
    queryString = queryString.substring(1);
    const functions = queryString
        ? props.functions.filter(createFilter(queryString))
        : props.functions
    const results = functions.map(api => ({ value: api }));
    cb(results);
}
const createFilter = (queryString: string) => {
    return (api: string) => {
        return (
            api.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
    }
}
const handleSelect = (api: string) => {
    console.log(api)
}

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

const docAnalyze = async () => {
    loading.value = true;
    const formData = new FormData();
    formData.append('role', role.value);
    formData.append('book_identify', props.bookIdentify);
    formData.append('doc_id', props.document.doc_id);
    formData.append('prompt', prompt.value);
    formData.append('action', props.functions.includes(prompt.value) ? "analyze" : "chat")
    let chatResponse = await axios.post('/aigc/chat', formData);
    let response = chatResponse.data;
    console.log(chatResponse)
    if (response.errcode !== 0) {
        ElMessage({
            message: response.message,
            type: 'warning',
        });
    } else {
        messages.value.push(response.data);
        await nextTick();
        scrollToBottom();
    }
    loading.value = false;
    prompt.value = "";
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
    <el-form
        class="mt-3"
        label-position="right"
        label-width="auto"
    >
        <el-form-item label="利益方">
           <el-input v-model="role"
                placeholder="ex. 甲方，张三"
            />
        </el-form-item>
    </el-form>
    <div class="self-stretch flex mb-3 justify-between">
        <el-autocomplete
            class="flex-1 inline-input"
            v-model="prompt"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            clearable
            placeholder="输入 / 选择或者直接提问"
        >
        </el-autocomplete>
        <el-button @click="docAnalyze" :loading="loading" class="ml-3" type="success" :icon="Promotion" />
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