<script lang="ts" setup>
import { computed, ref } from 'vue'
import axios from 'axios'

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
const dialogTableVisible = ref(false)
const result = ref([])
const current = ref(1)
const type = ref()

const loading = ref(false)
const functions = ref([])
const selectValue = ref([])
const popoverVisible = ref(false)

defineEmits(['anonymousProcessing', 'aiPreRequest'])

const handleCurrentChange = (val) => {
  result.value = data.value.slice(
    (current.value - 1) * pageSize.value,
    current.value * pageSize.value
  )
}

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
    value: 'MONEY'
  },
  {
    text: '组织',
    value: 'LOC_ORG'
  },
  {
    text: '日期',
    value: 'DATE'
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

const fetchFunctions = async (query: string) => {
  loading.value = true
  const response = await axios.get('/api/ai/function')
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
    reutrn
  }
  const data = response.data.data
  if (query) {
    functions.value = data.page.List.filter((item) => {
      return (item.template_name.toLowerCase().indexOf(query.toLowerCase()) !== -1) ||
        (item.template.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    })
  } else {
    functions.value = data.page.List
  }
  loading.value = false
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
    
    <el-popover
      :visible="popoverVisible"
      placement="bottom"
      :width="300"
    >
      <template #reference>
        <el-button
          @click="popoverVisible = !popoverVisible"
          class="flex-1" :disabled="entityRecognitionLoad">
          AI预请求
        </el-button>
      </template>
      <el-select
        v-model="selectValue"
        multiple
        filterable
        remote
        collapse-tags
        remote-show-suffix
        :remote-method="fetchFunctions"
        :loading="entityRecognitionLoad"
        placeholder="点击或者输入选择AI能力"
        style="width: 240px"
      >
        <el-option
          v-for="item in functions"
          :key="item.id"
          :label="item.template_name"
          :value="item.id"
        />
      </el-select>
      <div class="mt-2 flex items-end">
        <el-button size="small" text @click="popoverVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="popoverVisible = false; $emit('aiPreRequest', selectValue)">
          确认
        </el-button>
      </div>
    </el-popover>
  </div>
  <el-dialog v-model="dialogTableVisible" title="脱敏结果" top="0" width="800">
    <el-table :data="result">
      <el-table-column property="entity_id" label="实体" />
      <el-table-column property="replaced_text" label="原文" />
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
