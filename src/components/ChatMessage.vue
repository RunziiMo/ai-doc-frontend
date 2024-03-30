
<script setup>
import { ref, computed } from "vue";
import axios from 'axios'
import { marked } from 'marked'
import { Delete, UserFilled, Monitor } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  document: {
    type: Object,
    required: true,
  }
});
const response = computed(() => {
    try {
        return JSON.parse(props.message.response).result;
    } catch (error) {
        return props.message.response;
    }
});
const isError = computed(() => {
    return response.error && response.error.trim() !== "";
});
const isDelete = ref(false);
const deleteMessage = async (message) => {
    console.log(`/api/message/${message.message_id}`);
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
            <el-card v-html="marked(response)" class="px-3 flex-1" shadow="never"/>
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
