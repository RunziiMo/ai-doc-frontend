<template>
  <el-form
    v-model="dialogFormVisible"
    :model="form"
    label-width="auto"
    style="max-width: 600px"
    label-position="top"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="项目空间" prop="itemId">
      <el-select
        v-model="form.itemId"
        filterable
        remote
        reserve-keyword
        placeholder="每个项目必须归属一个项目空间，超级管理员可在后台管理和维护"
        remote-show-suffix
        :remote-method="itemSearch"
        :loading="loading"
      >
        <el-option v-for="item in options" :key="item" :label="item.text" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="项目标题" prop="book_name">
      <el-input v-model="form.book_name" placeholder="项目标题，不超过100字" />
    </el-form-item>
    <el-form-item label="项目标识" prop="identify">
      <el-input v-model="form.identify" placeholder="项目标识，不超过50字" />
    </el-form-item>
    <el-form-item label="项目描述" prop="description">
      <el-input type="textarea" v-model="form.description" placeholder="项目描述，不超过500字" />
    </el-form-item>
    <el-form-item label="">
      <el-radio-group v-model="form.privately_owned">
        <el-radio :value="1">公开(任何人都可以访问)</el-radio>
        <!-- <el-radio :value="0">私有(只有参与者或者使用令牌才能访问)</el-radio> -->
      </el-radio-group>
    </el-form-item>
    <el-form-item label="" prop="file">
      <el-upload
        v-model:file-list="form.file"
        class="upload-file w-full"
        :auto-upload="false"
        :before-upload="beforeUpload"
        multiple
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :on-exceed="handleExceed"
      >
        <div class="flex w-full">
            <el-input placeholder="请选择Zip或者Docx文件" class="flex-1"></el-input>
            <el-button type="primary">选择</el-button>
        </div>
      </el-upload>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm"> 创建 </el-button>
      <el-button @click="dialogFormVisible = false">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['update:dialogVisible'])
const dialogFormVisible = computed({
  get() {
    return props.dialogVisible
  },
  set(newValue) {
    emit('update:dialogVisible', newValue)
  }
})

// 表单数据
const form = reactive({
  itemId: '',
  book_name: '',
  identify: '',
  description: '',
  privately_owned: 1, // 假设公开为默认值
  file: [] // 文件列表
})

const rules = {
  itemId: [{ type: 'number', required: true, message: '请输入项目空间', trigger: 'blur' }],
  book_name: [
    { required: true, message: '请输入项目标题', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  identify: [
    { required: true, message: '请输入项目标识', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
  ],
  file: [
    {
      required: true,
      message: '请选择一个文件上传',
      trigger: 'change'
    },
    {
      validator: (rule, value, callback) => {
        console.log(value)
        if (value.length > 0) {
          const acceptTypes = [
            'application/zip',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf'
          ]
          value.forEach(file => {
            const raw = file.raw
            const fileType = raw.type;
            if (acceptTypes.indexOf(fileType) === -1) {
               return callback(new Error('文件类型必须是 ZIP 或 DOCX 或 PDF'))
            }
          });
          // 还可以添加其他文件属性检查，比如大小限制等
          callback()
        } else {
          callback(new Error('请选择一个文件上传'))
        }
      },
      trigger: 'change'
    }
  ]
}

// 表单引用，用于表单校验
const ruleFormRef = ref(null)

const beforeUpload = (file) => {
  // 处理文件上传的逻辑
  console.log(file)
}

const options = ref([])
const loading = ref(false)
const itemSearch = async (query) => {
  loading.value = true
  const params = {
    q: query
  }
  const response = await axios.get('/book/itemsets/search', { params })
  if (response.data.errcode !== 0) {
    ElMessage.warning(response.data.message)
  } else {
    options.value = response.data.data.results
  }
  loading.value = false
}

// 提交表单
function submitForm() {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      // 表单校验通过，开始提交表单数据
      console.log('提交数据', form)

      const formData = new FormData()
      formData.append('itemId', form.itemId)
      formData.append('book_name', form.book_name)
      formData.append('identify', form.identify)
      formData.append('description', form.description)
      formData.append('privately_owned', form.privately_owned)
      form.file.forEach(file => {
        formData.append('import-file', file.raw)
      })
      

      axios
        .post('/book/users/import', formData) // 替换为实际的API地址
        .then((response) => {
          if (response.data.errcode == 0) {
            ElMessage.success(response.data.message)
            // 重置表单
            form.itemId = 0
            form.book_name = ''
            form.identify = ''
            form.description = ''
            form.privately_owned = 1
            form.file = []
            dialogFormVisible.value = false
          } else {
            ElMessage.error('项目创建失败: ' + response.data.message)
          }
        })
        .catch((error) => {
          console.error('请求失败:', error)
          ElMessage.error('请求失败，请稍后再试')
        })
    } else {
      // 表单校验不通过，提示用户错误信息
      return false
    }
  })
}

// 假设的文件上传前的处理逻辑
async function beforeRemove(file, fileList) {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(`确定移除 ${file.name}？`)
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

// 处理文件超出限制的情况
function handleExceed(files, fileList) {
  this.$message.warning(
    `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`
  )
}

// 处理文件预览
function handlePreview(file) {
  console.log(file)
}

// 处理文件移除
function handleRemove(file, fileList) {
  console.log(file, fileList)
}
</script>
<style scoped>
:deep(.el-upload) {
    width: 100% !important;
}
</style>
