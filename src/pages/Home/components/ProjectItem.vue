<template>
    <el-card @click="enterProject" class="project-item">
        <div>{{docData.docName}}</div>
        <div>{{docData.docAuthor}}</div>
        
    </el-card>
</template>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();  
const enterProject = () => {  
    router.push(`/docs/${props.docData.bookId}`);  
};

const props = defineProps(['docData'])
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