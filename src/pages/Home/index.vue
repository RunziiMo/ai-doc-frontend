<template>
    <el-container>
        <el-header>
            <banner
                active-index="home"
                :search-handle="searchHandle"
                :switch-page="createProject">
            </banner>
        </el-header>
        <el-main>
            <div class="doc-list">
                <project-item
                    v-for="book in homeData.bookList"
                    :key="book"
                    :book-id="book.book_id"
                    :book="book">
                </project-item>
                <el-card class="add-doc" @click="addDocHandle">
                    <el-icon :size="30">
                        <Plus />
                    </el-icon>
                </el-card>
            </div>
        </el-main>
    </el-container>
    <el-dialog v-model="dialogVisible" title="项目空间">
        <add-project v-model:dialog-visible="dialogVisible">
        </add-project>
    </el-dialog>
</template>
<script setup>
import Banner from './components/Banner.vue';
import ProjectItem from './components/ProjectItem.vue';
import { reactive, ref, watch } from 'vue';
import AddProject from './components/AddProject.vue';
import axios from 'axios'

const homeData = reactive({
    bookList: []
})

const homeDataTemp = ref();

const dialogVisible = ref(false)
watch(
    () => dialogVisible.value,
    () => {
        fetchInitialData();
    }
)
function addDocHandle() {
    dialogVisible.value = true;
}

function searchHandle(searchText) {
    // homeData.bookList = [...mockData]

    // if (!searchText) {
    //     homeData.bookList = [...mockData]
    // }
    homeData.bookList = homeDataTemp.value.filter(item => item.book_name.indexOf(searchText) > -1 || item.identify.indexOf(searchText) > -1)
}
function createProject() {
    dialogVisible.value = true;
}

// 初始化请求  
async function fetchInitialData() {
    try {
        const response = await axios.get('/api/book/home');
        homeData.bookList = response.data.data;
        homeDataTemp.value = [...(response.data.data || [])];
        console.log("bookList", homeData.bookList)
    } catch (error) {
        console.error('初始化数据请求失败:', error);
        // 可以在这里处理错误，比如显示错误消息等  
    }
}

// 接口请求
fetchInitialData()
</script>
<style>
.doc-list {
    display: flex;
    /* justify-content: center; */
    gap: 15px;
    padding: 20px 20px;
    flex-wrap: wrap;
}

.add-doc {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 170px;
    height: 230px;
    border-radius: 3px;
}
</style>