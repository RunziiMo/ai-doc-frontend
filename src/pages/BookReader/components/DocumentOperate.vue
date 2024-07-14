<script lang="ts" setup>
import { ref } from 'vue'

const entityList = defineModel('entityList', {
  type: Array,
  default: () => []
})
const entityRecognitionLoad = defineModel('entityRecognitionLoading', {
  type: Boolean,
  default: false
})

defineEmits(['anonymousProcessing', 'aiPreRequest'])
const dialogTableVisible = ref(false)
const result = ref([])

const handleCurrentChange = () => {
  result.value = entityList.value.slice((current.value - 1) * 10, current.value * 10)
}

const current = ref(1)
const total = ref(0)

const handleView = async () => {
  dialogTableVisible.value = true

  total.value = entityList.value.length
  result.value = entityList.value.slice(current.value - 1, 10)
}
</script>

<template>
  <div class="document-operate-wrapper flex justify-between p-t-16px p-b-16px">
    <el-button
      class="flex-1"
      v-if="entityList.length === 0"
      :loading="entityRecognitionLoad"
      @click="$emit('anonymousProcessing')"
    >
      匿名实体识别
    </el-button>
    <el-button class="flex-1" v-else @click="handleView"> 脱敏结果 </el-button>
    <el-button class="flex-1" @click="$emit('aiPreRequest')" :disabled="entityRecognitionLoad">
      AI预请求
    </el-button>
  </div>
  <el-dialog v-model="dialogTableVisible" title="脱敏结果" width="800">
    <el-select>

    </el-select>
    <el-table :data="result">
      <el-table-column property="entity_id" label="实体" />
      <el-table-column property="origin_text" label="原文" />
      <el-table-column property="replaced_text" label="替换文本" />
      <el-table-column property="type" label="类型" >
        <template #default="{ row }"> {{ row.start_index }} ~ {{ row.end_index }} </template>
        </el-table-column>
      <el-table-column property="start_index" label="在文档中位置">
        <template #default="{ row }"> {{ row.start_index }} ~ {{ row.end_index }} </template>
      </el-table-column>
      <el-table-column property="confidence" label="置信度" />
    </el-table>
    <el-pagination
      v-model:current-page="current"
      :page-size="10"
      layout="total, prev, pager, next"
      :total="total"
      @current-change="handleCurrentChange"
    />
  </el-dialog>
</template>
