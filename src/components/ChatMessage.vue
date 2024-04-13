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
// Override function
const tokenizer = {
    codespan(src) {
        console.log(src);
        const match = src.match(/^\$+([^\$\n]+?)\$+/);
        if (match) {
            return {
                type: 'codespan',
                raw: match[0],
                text: match[1].trim()
            };
        }

        // return false to use original codespan tokenizer
        return false;
    }
};
function preprocess(markdown) {
    console.log(markdown);
    return markdown;
}
// Override function
function postprocess(html) {
    console.log(html);
    return html;
}

const walkTokens = (token) => {
    if (token.type !== 'text') {
        return;
    }
    console.log(token);
    const replacedText = token.text.replace(/【依据】(.*)/, (match, p1) => {
        return `<el-button @click="$emit('textSelected', '${p1}')">依据</el-button>${p1}`;
    });
    console.log(replacedText)
    token.text = replacedText
};
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
        result = JSON.parse(props.message.response).result;
    } catch (error) {
        ElMessage.warning(error);
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
const showSelectedText = () => {
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
                @mouseup="showSelectedText"
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
