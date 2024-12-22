<template>
    <el-dialog v-model="props.dialogVisible" :show-close="true" :before-close="props.close">
        <div slot="header" class="dialog-header">  
            <h1>项目设置</h1>  
            <div class="operate-btns">
                <el-button type="danger" @click="handleDeleteProject">删除项目</el-button>  
                <el-button @click="handleMakePrivate">转为私有</el-button>  
                <el-button @click="handleTransferProject">转让项目</el-button>
            </div>
            <!-- <el-button-group class="operation-buttons">  
                <el-button type="danger" @click="handleDeleteProject">删除项目</el-button>  
                <el-button @click="handleMakePrivate">转为私有</el-button>  
                <el-button @click="handleTransferProject">转让项目</el-button>  
            </el-button-group>   -->
        </div> 
        <el-form :model="form" label-width="auto" label-position="top" :rules="rules">
            <el-form-item label="项目空间" prop="projectSpace">
                <el-input v-model="form.projectSpace" />
            </el-form-item>
            <el-form-item label="项目标题" prop="projectTitle">
                <el-input v-model="form.projectTitle" />
            </el-form-item>
            <el-form-item label="项目描述" prop="projectDesc">
                <el-input type="textarea" v-model="form.projectDesc" />
            </el-form-item>
            <el-form-item label="项目AI能力" prop="projectAI">
                <el-input type="textarea" v-model="form.projectDesc" />
            </el-form-item>
            <el-form-item label="开启分享" prop="projectAI">
                <div style="display: flex; flex-direction: column">
                    <el-switch v-model="form.openShare" />
                    <text style="font-size: 12px">分享只对外项目生效，私有项目支持公开</text>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="submitForm(ruleFormRef)">
                    保存
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>
<script setup>
import { reactive } from 'vue'
import axios from 'axios'
const props = defineProps(['dialogVisible', 'close'])
// dialogHiddenHandle
const form = reactive({
  projectSpace: '',
  projectTitle: '',
  projectDesc: '',
  projectAI: '',
  file: '',
  openShare: true,
})

const rules = reactive({
    projectSpace: [
        { required: true, message: '请输入项目空间', trigger: 'blur' },
    ],
    projectTitle: [
        { required: true, message: '请输入项目标题', trigger: 'blur' },
    ],
    projectFlag: [
        { required: true, message: '请输入项目标识', trigger: 'blur' },
    ],
    projectDesc: [
        { required: true, message: '请输入项目描述', trigger: 'blur' },
    ],
});

const submitForm = async () => {
  try {
    console.log('submit!')
    // 模拟请求
    let response = await axios.post(`/api/xxx`, {form});
    const { code, msg } = response;
    // 根据code是否为0判断表单提交成功or失败
    if (code === 0) {
        // 成功-隐藏dialog
        dialogHiddenHandle();
    } else {
        // 失败-toast提示
    }
  } catch (error) {
    props.dialogHiddenHandle();
  }
}
function handlePreview() {}
function handleRemove() {}
function beforeRemove() {}
function handleExceed() {}
function handleDeleteProject() {  
    // 处理删除项目的逻辑  
}
function handleMakePrivate() {  
    // 处理转为私有的逻辑  
}
function handleTransferProject() {  
    // 处理转让项目的逻辑  
}
</script>
<style scoped>
.operation-buttons .el-button {  
    margin-left: 10px;  
}
.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.operate-btns {
    display: flex;
    gap: 5px;
}
</style> 