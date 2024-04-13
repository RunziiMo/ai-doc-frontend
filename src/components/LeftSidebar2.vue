<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { ElTree, ElInput } from 'element-plus'

const emit = defineEmits(['textSelected']);

const props = defineProps({
  documents: {
    type: Array,
    required: true
  },
  book: {  
    type: Object,
    required: true,
  },
});
  
interface Tree {
  [key: string]: any
}

const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

const defaultProps = {
    id: 'id',
    label: 'identify',
}

watch(filterText, (val) => {
    treeRef.value!.filter(val)
})
  
const filterNode = (value: string, data: Tree) => {
    if (!value) return true
    return data.identify.includes(value)
}

const handleNodeClick = (data: Tree) => {
  console.log("handleNodeClick:")
  console.log(data.id)
  emit('updateDocId', data.id)
}



const inputValue = ref('')
const dynamicTags = ref(['Tag 1', 'Tag 2', 'Tag 3'])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}
const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<template>
    <el-input
      v-model="filterText"
      style="width: 240px"
      placeholder="输入文件名或标签名过滤"
    />
  
    <!-- <el-link href="/" :underline="false"><el-button>首页</el-button></el-link> -->

    <el-tree
      ref = "treeRef"
      style = "max-width: 600px"
      class = "filter-tree"
      :data = "documents"
      :props = "defaultProps"
      default-expand-all
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">

        <div class="flex-col justify-start">
          <span>{{node.label }}</span>

          <div class="flex gap-2">
            <el-tag
              v-for="tag in dynamicTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="w-20"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
              + New Tag
            </el-button>
          </div>
        </div>

      </template>  
    </el-tree>
</template>
  