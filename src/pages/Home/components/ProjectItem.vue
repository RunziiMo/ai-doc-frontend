<template>
    <div>
        <el-card v-loading="book.status === 2"
            @click="showTip" class="project-item" shadow="hover">
            <el-link
                style="width: 170px; height: 230px"
                :href="`/docs/${book.identify}`"
                :disabled="book.status === 2">
                <el-image
                    :src="book?.cover"
                    :alt="book.book_name"
                    fit="cover" />
            </el-link>
        </el-card>
        <div><el-text>{{book.book_name}}</el-text></div>
        <el-text size="small">作者 - {{ book.create_name}}</el-text>
    </div>
</template>
<script setup>
const props = defineProps({
    book: {
        type: Object,
        required: true,
    },
});

const showTip = () => {
    if (props.book.status === 2) {
        ElMessage.warning("正在后台处理中，请稍后刷新页面")
    }
}
</script>
<style scoped>
.project-item {
    width: 170px;
    height: 230px;
}

:deep(.el-card__body) {
    padding: 0;
}
</style>