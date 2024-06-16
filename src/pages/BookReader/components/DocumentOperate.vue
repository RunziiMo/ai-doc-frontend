<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue';

const entityList = defineModel('entityList', {
  type: Array,
  default: () => []
})
const messageList = defineModel('messageList', {
  type: Array,
  default: () => []
})
const dialogTableVisible = ref(false)
const data = ref([
  {
    origin_text: '1',
    replaced_text: '3',
    type: '1',
    position: '1',
    confidence: 'ww'
  }
])
const handleAiRequest = () => {
  if (entityList.value.length === 0) {
    ElMessageBox.confirm('是否确认文档无需脱敏处理？', 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    return;
  }

  if (messageList.value?.length === 0) {
    ElMessageBox.confirm('您已经用过AI功能，确认需要重新发起预请求吗？', 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage({
        type: 'success',
        message: 'completed'
      })
    })
  }
}
</script>

<template>
  <div class="document-operate-wrapper">
    <el-button v-if="entityList.length !== 0"> 脱敏处理 </el-button>
    <el-button v-else @click="dialogTableVisible = true"> 脱敏结果 </el-button>
    <el-button @click="handleAiRequest"> AI预请求 </el-button>
  </div>
  <el-dialog v-model="dialogTableVisible" title="脱敏结果" width="800">
    <el-table :data="data">
      <el-table-column property="date" label="实体"/>
      <el-table-column property="origin_text" label="原文"/>
      <el-table-column property="replaced_text" label="替换文本" />
      <el-table-column property="type" label="类型" />
      <el-table-column property="position" label="在文档中位置" />
      <el-table-column property="confidence" label="置信度" />
    </el-table>
  </el-dialog>

</template>

<style scoped>
.document-operate-wrapper {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
</style>
