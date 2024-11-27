<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import '../../../../public/static/js/SIMHEI-normal.js'

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
  result.value = []
  data.value = []
  props.entityList?.forEach((el: any) => {
    const i = data.value.findIndex((item) => item.replaced_text === el.replaced_text)
    if (i === -1) {
      data.value.push(el)
    } else {
      data.value[i].entityList = [data.value[i], el]
    }
  })
  pageStore.total = data.value.length
  result.value = data.value?.slice(
    (pageStore.current - 1) * pageStore.pageSize,
    pageStore.current * pageStore.pageSize
  )
}
const indexMethod = (index: number) => {
  return index + 1 + (pageStore.current - 1) * pageStore.pageSize
}
clonedEntityList()
watch(
  () => props.entityList,
  () => {
    clonedEntityList()
  }
)
const filterHandler = (value, row, column) => {
  const property = column['property']
  return row[property] === value
}

const handleFliterChange = () => {
  // pageStore.total = result.value.length
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
const emit = defineEmits(['traceability'])
const handleClickEntity = (data, index) => {
  emit('traceability', {
    entityName: data.replaced_text,
    entityIndex: index
  })
}

const getExportTableData = () => {
  const exportData = data.value?.map((el, index) => [
    index + 1,
    el.replaced_text,
    getType(el.type),
    el?.entityList
      ?.map((item, itemIndex) => {
        return `${item.replaced_text}${itemIndex + 1}的上下文为：${item.window_text}`
      })
      .join('\n') || ''
  ])
  return [['序号', '实体名', '类型', '溯源'], ...(exportData || [])]
}
const handleTablePdfExport = () => {
  // 示例数据
  const data = getExportTableData()

  // 创建一个新的PDF文档
  const doc = new jsPDF()
  // 使用autoTable插件添加表格到PDF中
  autoTable(doc, {
    head: [data[0]], // 表头
    body: data.slice(1), // 表格内容（排除表头）
    styles: {
      fontSize: 12, // 字体大小
      font: 'SIMHEI',
      overflow: 'linebreak',
      cellWidth: 'auto',
      minCellWidth: 18 // 最小单元格宽度
    },
    columnStyles: { content: { cellWidth: 'auto' } }
  })

  // 保存PDF文件
  doc.save('table.pdf')
}
const handleTableExcelExport = async () => {
  const aoa = getExportTableData()

  /* dynamically import the SheetJS Wrapper */
  const XLSX = await import('@/utils/sheetJSWriteWrapper')

  // 创建一个新的工作簿
  const wb = XLSX.utils.book_new()

  // 将数据转换为工作表
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  // 设置列宽
  ws['!cols'] = [
    { wch: 5 }, // 序号 列宽度
    { wch: 10 }, // 实体名 列宽度
    { wch: 10 }, // 类型 列宽
    { wch: 60 } // 溯源更宽以防止溢出
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  XLSX.writeFileXLSX(wb, '实体结果.xlsx')
}
</script>
<template>
  <div class="w-full h-full flex flex-col">
    <el-table class="flex-1" :data="result" @filter-change="handleFliterChange">
      <el-table-column type="index" :index="indexMethod" label="序号" width="55px" />
      <el-table-column property="replaced_text" width="200px">
        <template #header>
          <span>实体名</span>
          <el-input
            v-model="entityKeyword"
            size="small"
            class="!w-65px m-l-4px"
            placeholder="搜索实体"
          />
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
        <template #default="{ row }">
          <div class="flex flex-wrap">
            <el-button
              type="text"
              v-for="(item, index) in row?.entityList"
              :key="item.entity_id"
              @click="handleClickEntity(item, index)"
            >
              {{ index + 1 }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex items-center justify-between">
      <el-pagination
        v-model:current-page="pageStore.current"
        :page-size="pageStore.pageSize"
        layout="total, prev, pager, next"
        :total="pageStore.total"
        @current-change="handleCurrentChange"
      />
      <div class="flex">
        <el-button type="primary" size="small" @click="handleTablePdfExport()"> pdf导出 </el-button>
        <el-button type="primary" size="small" @click="handleTableExcelExport()">
          excel导出
        </el-button>
      </div>
    </div>
  </div>
</template>
