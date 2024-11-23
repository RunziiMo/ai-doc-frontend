<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  entityList: {
    type: Array,
    default: () => []
  }
})

const pageStore = reactive({
  pageSize: 10,
  current: 1,
  total: 0
})
const result = ref([])
const data = ref([])
const entityKeyword = ref('')
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
  },
  {
    text: '数字',
    value: 'NUM'
  }
])

watch(entityKeyword, () => {
  const searchResult = data.value.filter(
    (data) =>
      !entityKeyword.value ||
      data.replaced_text.toLowerCase().includes(entityKeyword.value.toLowerCase())
  )
  pageStore.current = 1
  pageStore.total = searchResult.length
  result.value = searchResult?.slice(
    (pageStore.current - 1) * pageStore.pageSize,
    pageStore.current * pageStore.pageSize
  )
})

const clonedEntityList = () => {
  props.entityList.forEach((el, index) => {
    if (index < pageStore.pageSize) {
      result.value.push(el)
    }

    data.value.push(el)
    pageStore.total = props.entityList.length
  })
}
const indexMethod = (index: number) => {
  return index + 1 + (pageStore.current - 1) * pageStore.pageSize
}

watch(
  () => props.entityList,
  () => {
    result.value = []
    data.value = [];
    clonedEntityList()
  },
)
const filterHandler = (value, row, column) => {
  const property = column['property']
  return row[property] === value
}

const getType = (type) => {
  return typeList.value.find((el) => el.value === type)?.text
}

const handleCurrentChange = (val) => {
  pageStore.current = val
  result.value = data.value?.slice(
    (pageStore.current - 1) * pageStore.pageSize,
    pageStore.current * pageStore.pageSize
  )
}
</script>
<template>
  <div class="w-full h-full flex flex-col">
    <el-table class="flex-1" :data="result">
      <el-table-column type="index" :index="indexMethod" label="序号" width="55px" />
      <el-table-column property="replaced_text" width="136px">
        <template #header>
          <span>实体名</span>
          <el-input v-model="entityKeyword" size="small" class="!w-65px m-l-4px" placeholder="搜索实体" />
        </template>
      </el-table-column>
      <el-table-column
        property="type"
        label="类型"
        :filters="typeList"
        :filter-multiple="false"
        :filter-method="filterHandler"
      >
        <template #default="{ row }"> {{ getType(row.type) }} </template>
      </el-table-column>
      <el-table-column property="start_index" label="溯源">
        <template #default="{ row }"> {{ row.start_index }} ~ {{ row.end_index }} </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageStore.current"
      :page-size="pageStore.pageSize"
      layout="total, prev, pager, next"
      :total="pageStore.total"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
