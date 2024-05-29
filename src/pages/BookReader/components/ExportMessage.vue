<template>
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
        </div>
        <div class="self-end flex overflow-hidden">
            <el-text class="author" line-clamp="1">
                文档名：{{ document.identify }}
            </el-text>
        </div>
    </div>
    <div class="card answer">
        <div class="flex">
            <el-icon class="mr-3 mt-1">
                <Monitor />
            </el-icon>
            <el-text
                @mouseup="getSelectedText"
                @click="handleSourceClick"
                line-clamp="100">
                <div v-html="response"/>
            </el-text>
        </div>
        <div ref="messageAnchor" class="self-stretch" />
    </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { marked } from 'marked'
import { Delete, UserFilled, Monitor, Warning, Service } from '@element-plus/icons-vue'
import { ElMessage } from "element-plus";

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

const response = ref(marked(props.message.response));

const messageAnchor = ref()
watch(
    () => props.message.response,
    async (newValue, oldValue) => {
        response.value = marked(props.message.response);
        await nextTick();
        messageAnchor.value.scrollIntoView();
    }
);
</script>

<style>
</style>
