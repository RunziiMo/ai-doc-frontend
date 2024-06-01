<template>
    <div class="banner-content">
        <div class="banner-left">
            <div>合同分析</div>
            <div @click="enterHome">首页</div>
            <div class="create-project" @click="createProject">新建项目</div>
        </div>
        <div class="banner-right">
            <el-input
                v-model="searchModel"
                style="width: 240px"
                placeholder="请输入项目名/文件内容搜索"
                clearable
                @input="handleInput" 
            />
        </div>
        <div @click="enterPersonal">账号名称</div>
    </div>
</template>
<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router';
const props = defineProps(['searchHandle', 'createProject']);
const searchModel = ref('')
const router = useRouter();

function handleInput() {
    console.log('ddddd', searchModel);
    props.searchHandle(trimQuotes(searchModel.value));
}
function createProject() {
    props.createProject();
}
function trimQuotes(str) {
  return str.replace(/^"|"$/g, '');
}
function enterHome() {
    router.push("/");
}
// es6语法
// const enterHome = () => {  
//     router.push("/");
// };
function enterPersonal() {
    // router.push("/myspace");
    router.push("/");
}
</script>
<style>
.banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    /* background-color: #66b1ff; */
    border-bottom: 1px solid #ccc;
}
.banner-left {
    color: #;
    display: flex;
    gap: 20px;
}
.create-project:hover {
    color: rgb(25, 197, 197);
    cursor: pointer;
}
</style>