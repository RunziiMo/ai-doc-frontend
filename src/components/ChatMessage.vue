<script setup>
import { ref, computed } from "vue";
import axios from 'axios'
import { marked } from 'marked'
import { Delete, UserFilled, Monitor } from '@element-plus/icons-vue'

const props = defineProps({
    message: {
        type: Object,
        required: true,
    }
});

const renderer = {
    text(text) {
        if (!text.includes("【依据】")) {
            return false
        }
        const replacedText = text.replace(/(.*)【依据】(.*)/, (match, before, after) => {
            return `<a style="cursor: pointer;" title="${after}">${before}</a>`;
        });
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        return replacedText;
    }
};
marked.use({ renderer });
const response = computed(() => {
    const options = {
        gfm: true, // 开启 GitHub Flavored Markdown（GFM）
        breaks: true,
        headerIds: false // 禁止为标题自动生成 ID
        // 还可以添加其他自定义参数...
    };
    marked.use(options);
    let result = props.message.response;
    try {
        const jsonResult = JSON.parse(props.message.response)
        result = jsonResult.result;
    } catch (error) {
        console.log("parse message result error", error);
    }
    return marked(result);
});
const isError = computed(() => {
    return response.error && response.error.trim() !== "";
});
const isDelete = ref(false);
const deleteMessage = async (message) => {
    const response = await axios.delete(`/api/message/${message.message_id}`);
    const data = response.data;
    if (data.errcode !== 0) {
        ElMessage({
            message: data.message,
            type: 'warning',
        });
    } else {
       isDelete.value = true;
    }
    console.log(response);
};

const emit = defineEmits(['textSelected']);
const getSelectedText = () => {
    const selectedText = window.getSelection().toString();
    if (selectedText === '') {
        return
    }
    emit('textSelected', selectedText);
};
const handleSourceClick = (event) => {
    let targetElement = event.target;
    if (targetElement.hasAttribute('title')) {
        emit('textSelected', targetElement.getAttribute('title'));
    }
};
</script>

<template>
    <div v-if="!isDelete" class="query flex items-start justify-between">
        <el-icon>
            <UserFilled />
        </el-icon>
        <el-text class="query flex-1">
            <p class="px-3 my-0">
                {{ message.content }}
            </p>
        </el-text>
        <el-button v-if="message.show_del" @click="deleteMessage(message)" :icon="Delete" size="small" circle/>
    </div>
    <el-text v-if="!isDelete" class="author" :align="right">
        提问者：{{ message.author }}
    </el-text>
    <div v-if="!isDelete" class="answer my-3">
        <el-text class="flex items-start justify-between" :type="isError? 'danger' : ''" :align="'left'">
            <el-icon class="mr-3">
                <Monitor />
            </el-icon>
            <el-card
                @mouseup="getSelectedText"
                @click="handleSourceClick"
                v-html="response"
                class="px-3 flex-1"
                shadow="never"/>
        </el-text>
    </div>
</template>

<style scoped>
.query,
.answer {
    align-self: stretch;
}

.author {
    align-self: end;
}
</style>
