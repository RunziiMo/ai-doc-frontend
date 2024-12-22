<template>
    <el-table :data="tableData" style="width: 100%">
        <el-table-column label="ID" width="80">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{ scope.row.id }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="头像" width="80">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <img :src="scope.row.img" class="avatar"></img>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="用户名" width="120">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span>{{ scope.row.userName }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="真实姓名" width="80">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span>{{ scope.row.realName }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="角色" width="180">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <el-select v-model="scope.row.role" placeholder="Select" style="width: 130px">
                        <el-option v-for="item in roleOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <span>{{ scope.row.type }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <el-tag>{{ statusMapText[scope.row.status] }}</el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
                    编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                    禁用
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { Timer } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import axios from 'axios'

const handleEdit = (index, row) => {
    console.log(index, row)
}
const handleDelete = (index, row) => {
    console.log(index, row)
}

const statusMapText = ref({
    0: '异常',
    1: '正常'
});

const tableData = [
    {
        id: 1,
        img: 'https://www.baidu.com/img/flexible/logo/pc/result@2.png',
        userName: '测试',
        realName: '张三',
        role: 0,
        type: 'local',
        // 0 异常、1 正常
        status: 1
    },
    {
        id: 2,
        img: 'https://www.baidu.com/img/flexible/logo/pc/result@2.png',
        userName: '测试',
        realName: '里斯',
        role: 0,
        type: 'local',
        // 0 异常、1 正常
        status: 1
    }
]
const roleOptions = ref([
    {
        label: '普通用户',
        value: 0,
    },
    {
        label: '管理员用户',
        value: 1,
    },
    {
        label: '超级管理员用户',
        value: 2,
    }
]);

// 初始化请求表格数据的方法  
const fetchTableData = async () => {
    try {
        // 发起请求到你的API端点，获取表格数据  
        const response = await axios.get('/api/your-endpoint')
        // 假设返回的数据是一个对象，其中包含表格数据数组  
        if (response.data && Array.isArray(response.data)) {
            tableData.value = response.data
        } else {
            console.error('数据格式不正确或请求失败')
        }
    } catch (error) {
        console.error('请求表格数据时发生错误:', error)
    }
}

// 在组件加载时请求表格数据  
// fetchTableData()  
</script>

<style scoped>
.avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
}
</style>
