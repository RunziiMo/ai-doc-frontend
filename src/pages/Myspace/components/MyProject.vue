<template>
    <div>
        <div v-for="project, index in projectList" class="my-project-item" :key="index">
            <div>
                <div>{{project.projectName}}</div>
                <div class="my-project-info">
                    <span>{{timestampToDate(project.createTime)}}</span>
                    <span>{{project.creator}}</span>
                    <span>{{ROLE_ENUM[project.role]}}</span>
                </div>
            </div>
            <div>
                <el-select v-model="project.setup" placeholder="Select" style="width: 80px" @change="(e) => setupHandle(e, index)">
                    <el-option
                        v-for="item in setupOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </div>
        </div>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
const props = defineProps(['dialogHiddenHandle'])

const ROLE_ENUM = ref({
    0: '成员',
    1: '管理员',
    2: '创建者'
});
// dialogHiddenHandle

function timestampToDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

const projectList = reactive([
    {
        projectName: '测试1',
        createTime: 1713830154031,
        creator: '测试作者1',
        // 0 成员，1管理员，2创建者
        role: 2,
        setup: 1
    },
    {
        projectName: '测试2',
        createTime: 1713830154031,
        creator: '测试作者2',
        // 0 成员，1管理员，2创建者
        role: 2,
        setup: 1
    }
])

const setupOptions = ref([
    {
        value: 1,
        label: '阅读',
    },
    {
        value: 0,
        label: '删除',
    }
]);

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
const setupHandle = (event, index) => {
    console.log('event', event, index);
    if (event !== 0) return;
    projectList.splice(index, 1);
}
</script>
<style scoped>
.my-project-item {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding: 20px 0;
    /* font-size: 13px; */
}
.my-project-info {
    display: flex;
    gap: 20px;
    font-size: 13px;
    margin-top: 30px;
}
</style>
