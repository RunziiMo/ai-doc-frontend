<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElTree } from 'element-plus'

const emit = defineEmits(['updateDocId']);

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
      <!-- <template #default="{ node, data }">
        <span>  
          <el-link :href="`/api/${book.identify}/content/${node.id}`" :underline="false">{{ node.label }}</el-link>
          <a href="http://127.0.0.1:8181/docs/c1234/10">{{ node.label }}</a>
          <el-button @click="emit('textSelected', book.identify, node.id)">{{ node.label }}</el-button>
        </span>  
      </template>   -->
    </el-tree>
</template>
  