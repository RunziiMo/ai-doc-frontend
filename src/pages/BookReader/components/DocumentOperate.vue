<script lang="ts" setup>
import { ref } from 'vue'

const entityList = defineModel('entityList', {
  type: Array,
  default: () => []
})

defineEmits(['anonymousProcessing', 'aiPreRequest'])
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
</script>

<template>
  <div class="document-operate-wrapper flex justify-between p-t-16px p-b-16px">
    <el-button class="flex-1" v-if="entityList.length !== 0" @click="$emit('anonymousProcessing')">
      匿名实体识别
    </el-button>
    <el-button class="flex-1" v-else @click="dialogTableVisible = true"> 脱敏结果 </el-button>
    <el-button class="flex-1" @click="$emit('aiPreRequest')"> AI预请求 </el-button>
  </div>
  <el-dialog v-model="dialogTableVisible" title="脱敏结果" width="800">
    <el-table :data="data">
      <el-table-column property="date" label="实体" />
      <el-table-column property="origin_text" label="原文" />
      <el-table-column property="replaced_text" label="替换文本" />
      <el-table-column property="type" label="类型" />
      <el-table-column property="position" label="在文档中位置" />
      <el-table-column property="confidence" label="置信度" />
    </el-table>
  </el-dialog>
</template>


