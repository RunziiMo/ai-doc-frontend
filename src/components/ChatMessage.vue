<script setup>
import { ref, computed, nextTick } from "vue";
import axios from 'axios'
import { marked } from 'marked'
import { Delete, UserFilled, Monitor, Warning, Service } from '@element-plus/icons-vue'
import { ElMessage } from "element-plus";

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
    return response.value.error && response.value.error.trim() !== "";
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

const reasons = ['事实性错误', '没有理解问题', '答案格式错误', '不喜欢答案风格', '没有帮助', '其他']
const checkboxGroup = ref([]);
const showFeedback = ref(false);
const feedbackContainer = ref();
const switchFeedback = async () => {
    showFeedback.value = !showFeedback.value;
    await nextTick();
    if (feedbackContainer.value) {
        feedbackContainer.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};
const feedback = async () => {
    console.log(checkboxGroup.value.join(' '));
    const formData = new FormData();
    formData.append('feedback', checkboxGroup.value.join(' '));
    formData.append('agree', false);
    const response = await axios.post(`/api/message/${props.message.message_id}/feedback`, formData);
    const data = response.data;
    if (data.errcode !== 0) {
        ElMessage({
            message: data.message,
            type: 'warning',
        });
    } else {
        ElMessage({
            message: data.message,
            type: 'success',
        });
        showFeedback.value = false;
    }
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
    <div v-if="!isDelete" class="card query flex items-start justify-between">
        <div class="flex items-start justify-between">
            <el-icon class="mr-3 mt-1">
                <UserFilled />
            </el-icon>
            <el-text class="query flex-1">
                <p>
                    {{ message.content }}
                </p>
            </el-text>
        </div>
        <div class="self-end">
            <el-text class="author">
                提问者：{{ message.author }}
            </el-text>
            <el-button v-if="message.show_del"
                @click="deleteMessage(message)"
                class="ml-1"
                type="danger"
                :icon="Delete"
                size="small"
                circle/>
        </div>
    </div>
    <div v-if="!isDelete" class="card answer">
        <div class="flex items-start justify-between">
            <el-icon class="mr-3 mt-1">
                <Monitor />
            </el-icon>
            <el-text
                @mouseup="getSelectedText"
                @click="handleSourceClick"
                class="flex-1"
                shadow="never">
                <div v-html="response"/>
            </el-text>
        </div>
        <div class="self-end">
            <el-text>反馈数：{{ message.against_count }}</el-text>
            <el-button
                @click="switchFeedback"
                class="ml-1"
                type="warning"
                :icon="Warning"
                size="small"
                circle>
            </el-button>
        </div>
    </div>
    <div v-if="showFeedback" ref="feedbackContainer" class="card answer">
        <div class="flex items-start justify-between">
            <el-icon class="mr-3 mt-1">
                <Service />
            </el-icon>
            <el-text class="flex-1 flex flex-col">
                <span>请告诉我们反馈原因</span>
                <el-checkbox-group class="mb-3" v-model="checkboxGroup">
                    <el-checkbox
                        v-for="reason in reasons"
                        :key="reason" 
                        :label="reason"
                        :value="reason"
                        border
                        />
                </el-checkbox-group>
                <el-button @click="feedback" class="self-end" type="primary">提交</el-button>
            </el-text>
        </div>
    </div>
</template>

<style>
.query {
}

.answer {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background: var(--el-color-info-light-9);
    margin-top: 0.75rem;
}

.author {
    align-self: end;
}

.card {
    align-self: stretch;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
}

.card p:first-of-type {
    margin-top: 0;
}

.el-checkbox {
  margin-top: 12px;
}
</style>
