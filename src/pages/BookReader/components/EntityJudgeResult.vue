<script lang="ts" setup>
import { inject, reactive, ref, watch, type Ref } from 'vue'
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf'
import Mark from 'mark.js'
import EntityApi from '@/api/entity'
import '@/assets/js/SIMHEI-normal.js'
import useTypes from './use-types'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import type { Entity } from '@/api/types'

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
  book: {
    type: Object,
    required: true,
  },
  markEntitys: {
    type: Function,
    required: true,
  },
})

const entityList = inject<Ref<Entity[]>>('entityList')
const getEntityList = inject<Function>('getEntityList')
const formInstance = ref<FormInstance>()

const pageStore = reactive({
  pageSize: 10,
  current: 1,
  total: 0,
})
const data = ref([])
const entityKeyword = ref('')
const { typeList } = useTypes(props.book.item_name)

const form = reactive({
  type: '',
  replaced_text: '',
})

const result = ref()

watch(entityKeyword, () => {
  const searchResult = data.value.filter(
    (data) =>
      !entityKeyword.value ||
      data.replaced_text.toLowerCase().includes(entityKeyword.value.toLowerCase()),
  )
  pageStore.current = 1
  pageStore.total = searchResult.length
  result.value = searchResult?.slice(
    (pageStore.current - 1) * pageStore.pageSize,
    pageStore.current * pageStore.pageSize,
  )
})

const clonedEntityList = () => {
  result.value = []
  data.value = []
  entityList.value?.forEach((el: any) => {
    const i = data.value.findIndex((item) => item.replaced_text === el.replaced_text)
    if (i === -1) {
      el.entityList = [el]
      data.value.push(el)
    } else {
      data.value[i].entityList.push(el)
    }
  })
  pageStore.total = data.value.length
  result.value = data.value?.slice(
    (pageStore.current - 1) * pageStore.pageSize,
    pageStore.current * pageStore.pageSize,
  )
}
const indexMethod = (index: number) => {
  return index + 1 + (pageStore.current - 1) * pageStore.pageSize
}
clonedEntityList()
watch(entityList, () => {
  clonedEntityList()
})
const filterHandler = (value: any, row: { [x: string]: any }, column: { [x: string]: any }) => {
  const property = column['property']
  return row[property] === value
}

const handleFliterChange = (newFilters: any) => {
  if (!newFilters.type[0]) {
    result.value = data.value?.slice(
      (pageStore.current - 1) * pageStore.pageSize,
      pageStore.current * pageStore.pageSize,
    )
    pageStore.total = data.value.length
  } else {
    result.value = data.value
      .filter((item: any) => item.type === newFilters.type[0])
      ?.slice((pageStore.current - 1) * pageStore.pageSize, pageStore.current * pageStore.pageSize)
    pageStore.total = result.value.length
  }
}

const handleCurrentChange = (val: number) => {
  pageStore.current = val
  result.value = data.value?.slice(
    (pageStore.current - 1) * pageStore.pageSize,
    pageStore.current * pageStore.pageSize,
  )
}
const emit = defineEmits(['traceability', 'retract'])
// const handleClickEntity = (data: { replaced_text: any }, index: any) => {
//   emit('traceability', {
//     entityName: data.replaced_text,
//     entityIndex: index,
//   })
// }

const getExportTableData = () => {
  const exportData = data.value?.map((el, index) => [
    index + 1,
    el.replaced_text,
    el.type,
    el?.entityList
      ?.map((item: { window_text: any }, itemIndex: number) => {
        return `${itemIndex + 1}：${item.window_text}`
      })
      .join('\n') || '',
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
      minCellWidth: 18, // 最小单元格宽度
    },
    columnStyles: { content: { cellWidth: 'auto' } },
  })

  // 保存PDF文件
  doc.save(`${props.document.doc_name}-实体结果.pdf`)
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
    { wch: 60 }, // 溯源更宽以防止溢出
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  XLSX.writeFileXLSX(wb, `${props.document.doc_name}-实体结果.xlsx`)
}

const updateType = async (data: Partial<Entity>) => {
  if (!data.entity_id) return
  await EntityApi.edit(data)
  await getEntityList?.()
  props.markEntitys(entityList.value)
  ElMessage.success('ok')
}
const isAddBtn = ref(true)
const handleDelete = async (row: Partial<Entity & { entityList: Entity[] }>) => {
  if (!row.entity_id) {
    Object.assign(form, {
      type: '',
      replaced_text: '',
    })
    isAddBtn.value = true
    return
  }
  const num = row?.entityList?.length
  if (num > 1) {
    await ElMessageBox.confirm(
      `当前文章共有${num}个相同实体，确定后将全部删除，确定删除吗?`,
      'Warning',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  }

  await ElMessageBox.confirm('确定要删除吗?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  await EntityApi.delete(row)
  await getEntityList?.()
  const instance = new Mark(
    document.getElementById(`file-render-container-${props.document.doc_id}`),
  )
  row?.entityList.forEach((el) => {
    instance.unmark({
      className: `entity-${el.entity_id}`,
    })
  })

  ElMessage.success('ok')
}

const handleAdd = () => {
  isAddBtn.value = false
}

const handleSave = async () => {
  await formInstance.value?.validate()
  const text = document.getElementById(`file-render-container-${props.document.doc_id}`).textContent
  const num = text.match(new RegExp(form.replaced_text, 'g'))?.length
  await ElMessageBox.confirm(
    `当前文章共有${num}个相同实体，确定后将全部添加，确定添加吗?`,
    'Warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
  await EntityApi.add({
    ...form,
    document_id: props.document.doc_id,
    confidence: 1,
    window_text: '',
  })
  await getEntityList?.()
  props.markEntitys(entityList.value)
  ElMessage.success('ok')
  Object.assign(form, {
    type: '',
    replaced_text: '',
  })
  isAddBtn.value = true
}

const checkEntityName = (_rule: any, value: any, callback: any, data: Entity) => {
  if (!value) {
    callback(new Error('实体名不能为空'))
  } else {
    if (!data.entity_id) {
      const index = entityList.value?.findIndex((item) => item.replaced_text === value)
      if (index !== -1) {
        callback(new Error('该实体已存在，请重新输入'))
        return
      }
      const ind = entityList.value?.findIndex((item) => item.replaced_text.includes(value))
      if (ind !== -1) {
        callback(new Error('该实体是已经存在实体的子字符串，请重新输入'))
        return
      }
      const text = document.getElementById(
        `file-render-container-${props.document.doc_id}`,
      ).textContent
      if (!text.includes(value)) {
        callback(new Error('该实体不在文章中，请重新输入'))
        return
      }
      callback()
    }
    callback()
  }
}

const traceabilityMarks = ref()

const handleTraceability = (data) => {
  const instance = new Mark(
    document.getElementById(`file-render-container-${props.document.doc_id}`),
  )
  if (!data.isTraceability) {
    instance.unmark({
      className: `traceabilitying`,
      done() {
        instance.mark(data.replaced_text, {
          className: `traceabilitying`,
          acrossElements: true,
          separateWordSearch: false,
          diacritics: false,
          done() {
            data.isTraceability = true
            traceabilityMarks.value = Array.from(document.getElementsByClassName(`traceabilitying`)).filter(el => {
              return data.replaced_text.startsWith(el.textContent)
            })
            console.log(traceabilityMarks.value)
            if (traceabilityMarks.value.length > 0) {
              traceabilityMarks.value[0].scrollIntoView({
                behavior: 'smooth',
              })
            }
          },
        })
      },
    })
  } else {
    instance.unmark({
      className: `traceabilitying`,
      done() {
        data.isTraceability = false
      },
    })
  }
}

const currentTraceabilityIndex = ref(0)

const handleNextTraceability = () => {
  currentTraceabilityIndex.value += 1
  if (currentTraceabilityIndex.value > traceabilityMarks.value?.length - 1) {
    currentTraceabilityIndex.value = 0
  }
  // 元素滚动到当前视口
  traceabilityMarks.value[currentTraceabilityIndex.value]?.scrollIntoView({
    behavior: 'smooth',
  })
}
const handlePreTraceability = () => {
  currentTraceabilityIndex.value -= 1
  if (currentTraceabilityIndex.value < 0) {
    currentTraceabilityIndex.value = traceabilityMarks.value.length - 1
  }
  traceabilityMarks.value[currentTraceabilityIndex.value]?.scrollIntoView({
    behavior: 'smooth',
  })
}
</script>
<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-col flex-1 overflow-hidden position-relative">
      <el-auto-resizer class="flex-1 w-full">
        <template #default="{ width }">
          <el-table class="!h-100%" :data="result" @filter-change="handleFliterChange">
            <el-table-column type="index" :index="indexMethod" label="序号" width="55px">
              <template #default="{ row, $index }">
                <div class="flex items-center gap-8px">
                  <el-icon class="cursor-pointer" @click="handleDelete(row)"><Delete /></el-icon>
                  {{ $index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column property="replaced_text" :width="width / 2 - 55 + 'px'">
              <template #header>
                <div class="flex">
                  <span>实体名</span>
                  <el-input
                    v-model="entityKeyword"
                    size="small"
                    class="m-l-4px flex-1"
                    placeholder="搜索实体"
                  />
                </div>
              </template>
              <template #default="{ row }">
                <div v-if="row.entity_id" class="flex items-center gap-4px">
                  <el-icon
                    :class="{
                      'cursor-pointer': true,
                      'select-none': true,
                      'visible-hidden': !row.isTraceability,
                    }"
                    @click="handlePreTraceability()"
                  >
                    <CaretLeft />
                  </el-icon>
                  <span
                    class="underline underline-offset-4 select-none"
                    @click="handleTraceability(row)"
                  >
                    {{ row.replaced_text }}
                  </span>
                  <el-icon
                    :class="{
                      'cursor-pointer': true,
                      'select-none': true,
                      'visible-hidden': !row.isTraceability,
                    }"
                    @click="handleNextTraceability()"
                  >
                    <CaretRight />
                  </el-icon>
                </div>

                <el-input
                  v-else
                  :model-value="row.replaced_text"
                  placeholder="请输入实体名"
                  @change="() => updateType(row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              property="type"
              column-key="type"
              label="类型"
              :filters="typeList"
              :filter-multiple="false"
              :filter-method="filterHandler"
            >
              <template #default="{ row }">
                <el-select
                  :model-value="row.type"
                  placeholder="请选择"
                  @change="() => updateType(row)"
                >
                  <el-option
                    v-for="item in typeList"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-auto-resizer>
      <el-form
        ref="formInstance"
        :model="form"
        class="position-absolute !w-100% flex z-10 pos-bottom-0px items-center bg-#fff"
      >
        <template v-if="!isAddBtn">
          <div class="flex-1 flex">
            <div class="w-55px flex p-l-12px items-center">
              <el-icon class="cursor-pointer" @click="handleDelete(form)"><Delete /></el-icon>
            </div>
            <el-form-item
              class="m-b-14px m-t-18px"
              prop="replaced_text"
              :rules="{
                validator: checkEntityName,
                trigger: 'blur',
              }"
            >
              <el-input v-model.trim="form.replaced_text" placeholder="请输入实体名" />
            </el-form-item>
          </div>
          <div class="flex-1 flex gap-4px p-l-22px items-center">
            <el-form-item
              prop="type"
              class="flex-1 m-b-14px m-t-18px"
              :rules="{
                required: true,
                message: '类型为必选项',
                trigger: 'blur',
              }"
            >
              <el-select v-model="form.type" class="!w-100%" placeholder="请选择">
                <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-button class="w-50px" @click="handleSave"> 保存 </el-button>
          </div>
        </template>

        <el-button v-else class="w-full" @click="handleAdd">新增</el-button>
      </el-form>
    </div>

    <div class="flex items-center justify-between">
      <el-pagination
        v-model:current-page="pageStore.current"
        :page-size="pageStore.pageSize"
        layout="total, prev, pager, next"
        :total="pageStore.total"
        @current-change="handleCurrentChange"
      />
      <div class="flex">
        <el-button type="primary" size="small" @click="$emit('retract')"> 收起 </el-button>
        <el-button type="primary" size="small" @click="handleTablePdfExport()"> pdf导出 </el-button>
        <el-button type="primary" size="small" @click="handleTableExcelExport()">
          excel导出
        </el-button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.visible-hidden {
  visibility: hidden;
}
:deep(.el-scrollbar__view) {
  padding-bottom: 40px !important;
}
</style>
<style>
.traceabilitying {
  border: 1px solid var(--el-color-primary) !important;
}
</style>
