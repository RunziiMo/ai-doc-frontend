<template>
    <div class="self-stretch">
        <el-checkbox v-if="props.export"
            v-model="isChecked"
            :value="message.message_id"
            @change="checkMessage(message.message_id)"/>
        <div class="card query">
            <div class="flex overflow-hidden">
                <el-icon class="mr-3 mt-1">
                    <UserFilled />
                </el-icon>
                <el-text class="query flex-1">
                    <p>
                        {{ message.content }}
                    </p>
                </el-text>
            </div>
            <div class="self-end flex overflow-hidden">
                <el-text class="author" line-clamp="1">
                    提问者：{{ message.author }}
                </el-text>
                <el-button v-if="message.show_del &&!props.export"
                    @click="deleteMessage(message)"
                    class="ml-1"
                    type="danger"
                    :icon="Delete"
                    size="small"
                    circle/>
            </div>
        </div>
    </div>
    <div class="self-stretch flex">
        <el-checkbox v-if="props.export"
            v-model="isChecked"
            :value="message.message_id"
            @change="checkMessage(message.message_id)"/>
        <div class="card answer">
            <div class="flex">
                <el-icon class="mr-3 mt-1">
                    <Monitor />
                </el-icon>
                <el-input
                    v-if="!isReadonly && !props.export"
                    v-model="cloneResponse"
                    style="width: 100%"
                    :autosize="{ minRows: 4, maxRows: 20 }"
                    type="textarea"
                />
                <el-skeleton
                    v-else-if="message.response === ''"
                    :rows="3" animated />
                <el-text
                    v-else
                    @mouseup="getSelectedText"
                    @click="handleSourceClick"
                    line-clamp="100">
                    <div v-html="response"/>
                </el-text>
            </div>
            <div v-if="!props.export" ref="messageAnchor" class="self-stretch flex flex-nowrap justify-between overflow-hidden">
                <div>
                    <el-button
                        @click="emit('switchExport', message.message_id)"
                        class="ml-1"
                        :icon="Share"
                        size="small">
                        导出
                    </el-button>
                </div>
                <div class="flex flex-nowrap">
                    <el-text line-clamp="1">反馈数：{{ message.against_count }}</el-text>
                    <el-button
                        @click="switchFeedback"
                        class="ml-1"
                        type="warning"
                        :icon="Warning"
                        size="small"
                        circle>
                    </el-button>
                    <el-button v-if="isReadonly"
                        class="ml-1"
                        :icon="Edit"
                        size="small"
                        @click="isReadonly = false"
                        circle/>
                    <template v-else>
                        <el-button class="!ml-1" size="small" @click="handleSave">更新</el-button>
                        <el-button class="!ml-1" size="small" @click="handleCancel">取消</el-button>
                    </template>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showFeedback && !props.export" ref="feedbackContainer" class="card answer">
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

<script setup>
import { ref, watch, computed, nextTick, inject } from "vue";
import axios from 'axios'
import { marked } from 'marked'
import { Delete, UserFilled, Monitor, Warning, Service, Edit, Share } from '@element-plus/icons-vue'
import { ElMessage } from "element-plus";

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
    export: {
        type: Boolean,
        required: true,
    },
});

const response = ref(marked(props.message.response));
const cloneResponse = ref(props.message.response);

const messageAnchor = ref()
watch(
    () => props.message.response,
    async (newValue, oldValue) => {
        response.value = marked(props.message.response);
        cloneResponse.value = props.message.response;
        await nextTick();
        messageAnchor.value.scrollIntoView();
    }
);
const deleteMessage = async (message) => {
    const response = await axios.delete(`/api/message/${message.message_id}`);
    const data = response.data;
    if (data.errcode !== 0) {
        ElMessage({
            message: data.message,
            type: 'warning',
        });
    } else {
        ElMessage.success('删除消息成功')
        emit('deletedMessage', message.message_id)
    }
};

const reasons = ['事实性错误', '没有理解问题', '答案格式错误', '不喜欢答案风格', '没有帮助', '其他']
const checkboxGroup = ref([]);
const showFeedback = ref(false);
const feedbackContainer = ref();
const switchFeedback = async () => {
    showFeedback.value = !showFeedback.value;
    checkedMessages.value.push(props.message.message_id);
    checkMessage(props.message.message_id);
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

const emit = defineEmits(['textSelected',
    'updateResponseSuccess',
    'switchExport',
    'deletedMessage',
]);

const checkedMessages = inject('checkedMessages');
const checkMessage = inject('checkMessage');
const isChecked = computed(() => checkedMessages.value.includes(props.message.message_id));

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

const isReadonly = ref(true)

const handleSave = async () => {
    const formData = new FormData();
    formData.append('response', cloneResponse.value);
    const response = await axios.post(`/api/message/${props.message.message_id}/update`, formData);
    const data = response.data;
    if (data.errcode !== 0) {
        ElMessage({
            message: data.message,
            type: 'warning',
        });
    } else {
        emit('updateResponseSuccess', props.message.message_id, cloneResponse.value);
        isReadonly.value = true;
        ElMessage({
            message: data.message,
            type: 'success',
        });
    }
}
const handleCancel = () => {
  response.value = marked(props.message.response)
  cloneResponse.value = props.message.response;
  isReadonly.value = true;
}

</script>

<style>
.message-view {
  width: 100% !important;
}

.message-view .el-textarea__inner {
  box-shadow: none !important;
  background-color: unset !important;
  color: unset !important;
  padding: 0;
  min-height: 14px !important;
  height: unset !important;
  resize: none;
}

.answer {
    border-radius: var(--el-border-radius-base);
    background: var(--el-color-info-light-9);
}

.card {
    width: calc(100% - 1.5rem);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-self: stretch;
}

.card p:first-of-type {
    margin-top: 0;
}

.card.el-checkbox {
  margin-top: 12px;
}
</style>
