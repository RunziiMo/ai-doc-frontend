<template>
    <div>
        <el-card class="project-item" shadow="hover">
            <router-link :to="`/docs/${docData.identify}`">
                <el-image style="width: 170px; height: 230px" :src="docData?.cover" fit="cover" />
            </router-link>
        </el-card>
        <div><el-text>{{docData.book_name}}</el-text></div>
        <el-text size="small">作者 - {{ docData.create_name}}</el-text>
    </div>
</template>
<script setup>
const props = defineProps({
    docData: {
        type: Object,
        required: true,
    },
});
</script>
<style>
.project-item {
    width: 170px;
    height: 230px;
}

.el-card__body {
    padding: 0;
}
</style>