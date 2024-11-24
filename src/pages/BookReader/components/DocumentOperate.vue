<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus';

const entityList = defineModel('entityList', {
  type: Array,
  default: () => []
})
const entityRecognitionLoad = defineModel('entityRecognitionLoading', {
  type: Boolean,
  default: false
})

const popoverVisible = ref(false)

const loading = ref(false)
const functions = ref([])
const aiTableRef = ref()
const formInstance = ref()

const emit = defineEmits(['anonymousProcessing', 'aiPreRequest', 'requestEntityResult'])

const fetchFunctions = async (query: string) => {
  loading.value = true
  const response = await axios.get('/api/ai/function')
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
    return;
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

const lawsOptions = ref([])

const fetchLaws = async () => {
  const response = await axios.get('/api/ai/law')
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
    return
  }
  lawsOptions.value = response.data.data.map(el => ({label: el, value: el}))
}

const handleFunctions = () => {
  popoverVisible.value = true
  fetchFunctions('')
  fetchLaws()
}

const selectedFunstions = ref([])

const handleSelectionChange = (arr) => {
  selectedFunstions.value = arr;
}

const showlaw = (func) => {
  return func.template.includes('{{ law }}')
}

const showRole = (func) => {
  return func.template.includes('{{ role }}')
}

const handleConfirm = async() => {
  await formInstance.value.validate();
  popoverVisible.value = false; 
  emit('aiPreRequest', selectedFunstions.value)
}

const checkLaw = (row, rule, value, callback) => {
  const isSelect = selectedFunstions.value.findIndex(el => el.id === row.id) !== -1
  if (isSelect && !value) {
    callback(new Error('参考法律为必选项'));
  } else {
    callback();
  }

}

const checkRole =(row, rule, value, callback) => {
  const isSelect = selectedFunstions.value.findIndex(el => el.id === row.id) !== -1
  if (isSelect && !value) {
    callback(new Error('利益方为必填项'));
  } else {
    callback();
  }

}
</script>

<template>
  <div class="document-operate-wrapper flex justify-between p-b-8px">
    <el-button
      class="flex-1"
      v-if="entityList?.length === 0"
      :loading="entityRecognitionLoad"
      @click="$emit('anonymousProcessing')"
    >
      实体识别
    </el-button>
    <el-button class="flex-1" v-else @click="$emit('requestEntityResult')"> 实体结果 </el-button>
    
    <el-popover
      :visible="popoverVisible"
      placement="bottom"
      title="AI预请求"
      width="580"
      trigger="click"
      :popper-options="{
          modifiers: [
          {
            name: 'offset',
            options: {
              offset: [-200, 5],
            },
          },
        ],
      }"
    >
    <el-form :model="{ functions }" ref="formInstance">
        <el-table ref="aiTableRef" :height="470" :data="functions" v-loading="loading" row-key="id" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column property="template_name" label="能力" />
          <el-table-column label="参考法律">
            <template #default="{ row, $index }">
              <el-form-item
                v-if="showlaw(row)" 
                :prop="`functions.${$index}.law`"
                :rules="{
                  validator: (rule, value, callback) => checkLaw(row, rule, value, callback),
                  trigger: 'change',
                }"
                class="!m-b-14px !m-t-14px"
              >
                <el-select v-model="row.law" placeholder="默认参考文档" >
                  <el-option v-for="option in lawsOptions" :label="option.label" :value="option.value" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="利益方">
            <template #default="{ row, $index }">
              <el-form-item
                v-if="showRole(row)" 
                :prop="`functions.${$index}.role`"
                :rules="{
                  validator: (rule, value, callback) => checkRole(row, rule, value, callback),
                  trigger: 'change',
                }"
                class="!m-b-14px !m-t-14px"
              >
                <el-input v-model="row.role" placeholder="请填写利益方" />
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex items-center justify-center p-t-16px">
          <el-button @click="popoverVisible = false" class="w-120px">取消</el-button>
          <el-button type="primary" class="w-120px" @click="handleConfirm">
            确认
          </el-button>
        </div>
      </el-form>
      <template #reference>
        <el-button
          @click="handleFunctions"
          class="flex-1" :disabled="entityRecognitionLoad">
          AI预请求
        </el-button>
      </template>
    </el-popover>
  
  </div>
</template>
<style scoped>
.el-table--fit {
  height: 600px;
}
</style>
