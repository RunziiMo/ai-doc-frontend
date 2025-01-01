<script lang="ts">
import type { PropType } from 'vue'
import type { BookInfo } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

export default {
  data() {
    return {
      showDialog: false,
    }
  },
  props: {
    modelValue: Boolean,
    book: {
      type: Object as PropType<BookInfo>,
    },
    document: Object,
    model: Object,
  },
  emits: ['update:modelValue', 'hideSide'],
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    editable() {
      return false
      // return this.book.role_id === 0 || this.book.role_id === 1 || this.book.role_id === 2;
    },
    owner() {
      return this.book?.role_id === 0 || this.book?.role_id === 1
    },
  },
  methods: {
    onBack() {
      window.history.back()
    },
    handleDelete() {
      ElMessageBox.confirm('确定是否删除当前项目？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        // 调用删除项目Api
        const formData = new FormData()
        formData.append('identify', this.book.identify)
        const response = await axios.post('/book/setting/delete', formData)
        const data = response.data
        if (data.errcode !== 0) {
          ElMessage({
            message: data.message,
            type: 'warning',
          })
        } else {
          ElMessage({
            message: '删除项目成功',
            type: 'success',
          })
        }
        this.$router.push('/')
      })
    },
    handleClickExpand() {
      this.$emit('hideSide')
    },
  },
}
</script>

<template>
  <el-page-header @back="onBack" :icon="null">
    <template #content>
      <div class="flex items-center">
        <el-icon class="mr-2" @click="handleClickExpand"><Expand /></el-icon>
        <el-divider direction="vertical" />
        <span class="text-large font-600 mr-3"> {{ (book as any)?.book_name }} </span>
        <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
          {{ document.doc_name }}
        </span>
      </div>
    </template>
    <template #extra>
      <div class="flex items-center">
        <el-switch v-model="value" active-text="问答" inactive-text="全屏" />
        <el-link href="/" :underline="false"><el-button>首页</el-button></el-link>
        <el-link v-if="editable" :href="`/api/${(book as any)?.identify}/edit/`" :underline="false"
          ><el-button type="danger">编辑</el-button></el-link
        >
        <!-- <el-link v-if="owner" :href="`/book/${book.identify}/users`" :underline="false"><el-button type="success">成员</el-button></el-link> -->
        <el-link v-if="owner" :href="`/book/${(book as any)?.identify}/setting`" :underline="false"
          ><el-button type="primary">设置</el-button></el-link
        >
        <!-- <el-link href="javascript:window.print();" :underline="false"><el-button>打印</el-button></el-link> -->
        <!-- <el-button v-if="book.privately_owned === 0 && book.is_enable_share" @click="showDialog = true" type="success">分享</el-button> -->
        <!-- <el-dropdown v-if="book.is_download">
          <el-button type="primary">
            下载<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                  <el-link :href="`/export/${book.identify}?output=pdf`"
                      :underline="false"
                      target="_blank">PDF</el-link>
              </el-dropdown-item>
              <el-dropdown-item>
                  <el-link :href="`/export/${book.identify}?output=epub`"
                      :underline="false"
                      target="_blank">EPUB</el-link>
              </el-dropdown-item>
              <el-dropdown-item>
                  <el-link :href="`/export/${book.identify}?output=mobi`"
                      :underline="false"
                      target="_blank">MOBI</el-link>
              </el-dropdown-item>
              <el-dropdown-item>
                  <el-link :href="`/export/${book.identify}?output=docx`"
                      :underline="false"
                      target="_blank">Word</el-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="book.editor === 'markdown'">
                  <el-link :href="`/export/${book.identify}?output=markdown`"
                      :underline="false"
                      target="_blank">Markdown</el-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>-->
        <el-button type="danger" class="m-l-8px" @click="handleDelete">
          删除项目<el-icon class="el-icon--right"> <delete /></el-icon>
        </el-button>
      </div>
    </template>
  </el-page-header>
  <ShareDialog v-model:showDialog="showDialog" :book="book" />
</template>

<style scoped>
@media print {
  .el-page-header {
    display: none;
  }
}
.el-page-header {
  width: 100%;
}
.el-switch + .el-link {
  margin-left: 12px;
}
.el-switch + a {
  margin-left: 12px;
}
a + .el-link {
  margin-left: 12px;
}
.el-link.el-link {
  margin-left: 12px;
}
.el-button + .el-link {
  margin-left: 12px;
}
.el-link + .el-button {
  margin-left: 12px;
}
.el-link + .el-link {
  margin-left: 12px;
}
.el-link + .el-dropdown {
  margin-left: 12px;
}
.el-button + .el-dropdown {
  margin-left: 12px;
}
</style>
