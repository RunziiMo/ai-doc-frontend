
<script setup>
import { ref, computed } from "vue";
import axios from 'axios'
import { Delete } from '@element-plus/icons-vue'

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
    <div v-if="!isDelete" class="query flex items-start justify-between py-3">
        <el-text class="flex-1 pl-3" :align="'left'">
            <el-text tag="b" class="pr-3">
                {{ message.author }}:
            </el-text>
            {{ message.content }}
        </el-text>
        <el-button v-if="message.show_del" @click="deleteMessage(message)" :icon="Delete" circle/>
    </div>
    <el-text v-if="!isDelete" class="answer self-stretch" :type="isError? 'danger' : ''" :align="'left'">
        <el-text tag="b" class="pr-3">
            AI Bot:
        </el-text>
        {{ response }}
    </el-text>
</template>

<style scoped>
.query,
.answer {
    align-self: stretch;
}
</style>
