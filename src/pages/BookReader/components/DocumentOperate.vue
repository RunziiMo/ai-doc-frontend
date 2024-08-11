<script lang="ts" setup>
import { computed, ref } from 'vue'

const entityList = defineModel('entityList', {
  type: Array,
  default: () => []
})
const entityRecognitionLoad = defineModel('entityRecognitionLoading', {
  type: Boolean,
  default: false
})

const data = ref([])
const pageSize = ref(50)

defineEmits(['anonymousProcessing', 'aiPreRequest'])
const dialogTableVisible = ref(false)
const result = ref([])

const handleCurrentChange = (val) => {
  result.value = data.value.slice(
    (current.value - 1) * pageSize.value,
    current.value * pageSize.value
  )
}

const current = ref(1)
const type = ref()
const typeList = ref([
  {
    text: '人名',
    value: 'PERSON'
  },
  {
    text: '地名',
    value: 'LOCATION'
  },
  {
    text: '金额',
    value: '金额'
  },
  {
    text: '组织',
    value: '组织'
  },
  {
    text: '日期',
    value: 'DATE_TIME'
  }
])

const total = computed(() => {
  return data.value.length || 0
})

const handleView = async () => {
  dialogTableVisible.value = true
  data.value = entityList.value
  result.value = data.value.slice(current.value - 1, pageSize.value)
}
const getType = (type) => {
  return typeList.value.find((el) => el.value === type)?.text
}

const filterHandler = (value, row, column) => {
  const property = column['property']

  return row[property] === value
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
  <el-dialog v-model="dialogTableVisible" title="脱敏结果" top="0" width="800">
    <el-table :data="result">
      <el-table-column property="entity_id" label="实体" />
      <el-table-column property="origin_text" label="原文" />
      <el-table-column property="replaced_text" label="替换文本" />
      <el-table-column
        property="type"
        label="类型"
        :filters="typeList"
        :filter-multiple="false"
        :filter-method="filterHandler"
      >
        <template #default="{ row }"> {{ getType(row.type) }} </template>
      </el-table-column>
      <el-table-column property="start_index" label="在文档中位置">
        <template #default="{ row }"> {{ row.start_index }} ~ {{ row.end_index }} </template>
      </el-table-column>
      <el-table-column property="confidence" label="置信度" />
    </el-table>
    <el-pagination
      v-model:current-page="current"
      :page-size="pageSize"
      layout="total, prev, pager, next"
      :total="total"
      @current-change="handleCurrentChange"
    />
  </el-dialog>
</template>
<style scoped>
.el-table--fit {
  height: 600px;
}
</style>
