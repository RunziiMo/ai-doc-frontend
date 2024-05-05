<template>
    <el-card @click="enterProject" class="project-item">
        <div>{{docData.book_name}}</div>
        <div>{{docData.identify}}</div>
        
    </el-card>
</template>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();  
const enterProject = () => {  
    router.push(`/docs/${props.docData.identify}`);  
};

const props = defineProps(['docData'])

console.log("docData_2", props.docData)
</script>
<style>
.project-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 140px;
    height: 200px;
    /* border: 1px solid #999999; */
    border-radius: 3px;
}
</style>