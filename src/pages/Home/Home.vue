<template>
    <div class="home-content">
        <banner :search-handle="searchHandle" :create-project="createProject"></banner>
        <div class="doc-list">
            <project-item
                v-for="book in homeData.bookList"
                :key="book"
                :book-id="book.book_id"
                :doc-data="book">
            </project-item>
            <el-card class="add-doc" @click="addDocHandle">
                <el-icon :size="30">
                    <Plus />
                </el-icon>
            </el-card>
        </div>
        <el-dialog v-model="dialogVisible" title="项目空间">
            <add-project :dialog-hidden-handle="dialogHiddenHandle"></add-project>
        </el-dialog>
    </div>
</template>
<script setup>
import Banner from './components/Banner.vue';
import ProjectItem from './components/ProjectItem.vue';
import { reactive, ref } from 'vue';
import AddProject from './components/AddProject.vue';
import axios from 'axios'
const homeData = reactive({
    bookList: []
})
const dialogVisible = ref(false)
function test() {
    this.$router.push('/docs')
}
function addDocHandle() {
    dialogVisible.value = true;
}
function dialogHiddenHandle() {
    dialogVisible.value = false;
}
function searchHandle(searchText) {
    // homeData.bookList = [...mockData]

    // if (!searchText) {
    //     homeData.bookList = [...mockData]
    // }
    homeData.bookList = homeData.bookList.filter(item => item.book_name.indexOf(searchText) > -1 || item.identify.indexOf(searchText) > -1)
}
function createProject() {
    dialogVisible.value = true;
}

/***
const mockData = [
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
        bookId: 4,
    },
    {
        doctId: 1,
        docName: '项目名2-测试',
        docAuthor: '作者2-测试',
        bookId: 4,
    },
    {
        doctId: 1,
        docName: '项目名3-测试',
        docAuthor: '作者13测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    },
    {
        doctId: 1,
        docName: '项目名1-测试',
        docAuthor: '作者1-测试',
    }
];
homeData.bookList = [...mockData]
 */

// 初始化请求  
async function fetchInitialData() {
    try {
        const response = await axios.get('/api/book/home'); // 替换为你的API地址
        homeData.bookList = response.data.data; // 假设返回的数据结构与你定义的homeData.bookList一致
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
.home-content {}

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
    width: 130px;
    height: 200px;
    border-radius: 3px;
}
</style>