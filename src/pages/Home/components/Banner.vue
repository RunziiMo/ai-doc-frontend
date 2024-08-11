<template>
    <el-menu
        :default-active="activeIndex"
        :ellipsis="false"
        :router="true"
        class="el-menu-demo flex-grow"
        mode="horizontal"
    >
        <el-text size="large" tag="b">AI DOC</el-text>
        <div class="flex-grow" />
        <el-input
            v-if="activeIndex === 'home'"
            v-model="searchModel"
            style="width: 240px"
            placeholder="请输入项目名/文件内容搜索"
            clearable
            @input="handleInput"
        />
        <el-menu-item index="home">项目列表</el-menu-item>
        <el-menu-item index="function">AI能力</el-menu-item>
        <el-menu-item index="myspace">账号名称</el-menu-item>
    </el-menu>
</template>
<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router';

const props = defineProps(['activeIndex', 'searchHandle', 'switchPage']);
const searchModel = ref('')
const router = useRouter();

function handleInput() {
    console.log('ddddd', searchModel);
    props.searchHandle(trimQuotes(searchModel.value));
}
function switchPage() {
    props.switchPage();
}
function trimQuotes(str) {
  return str.replace(/^"|"$/g, '');
}
function enterPersonal() {
    // router.push("/myspace");
    router.push("/");
}
</script>
<style>
.banner-left {
    color: #;
    display: flex;
    gap: 20px;
}
.banner-item:hover {
    color: rgb(25, 197, 197);
    cursor: pointer;
}
</style>