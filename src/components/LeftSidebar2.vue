<script lang="ts" setup>
import { ref, watch, nextTick, reactive, toRefs } from 'vue'
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
let documentsReactive = '';

interface Tree {
  [key: string]: any
}

const { documents } = toRefs(props);
const loadDocuments = ref([]);


const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

watch(documents, (newDocuments) => {
    loadDocuments.value = newDocuments;
}, { deep: true, immediate: true });

const defaultProps = {
    id: 'id',
    label: 'identify',
}



const filterNode = (value: string, data: Tree) => {
    if (!value) return true
    console.log('xxxxxxx', value);
    return data.identify.includes(value) || (data.dynamicTags && data.dynamicTags.some(item => item.indexOf(value) > -1));
}

const handleNodeClick = (data: Tree) => {
  console.log("handleNodeClick:")
  console.log(data.id)
  emit('updateDocId', data.id)
}



const inputValue = ref('')
const editProjectNameValue = ref('');
const dynamicTags = ref(['Tag1', 'Tag2', 'Tag3'])
const inputVisibleKey = ref('')
const editProjectNameVisibleKey = ref('');
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string, nodeData: any) => {
  console.log('tag: string, nodeData: any', tag, nodeData);
  const node = treeRef.value.getNode(nodeData.key);
  if (node) {
      const index = node.data.dynamicTags.indexOf(tag);
      if (index > -1) {
          node.data.dynamicTags.splice(index, 1);
      }
  }
}
const showInput = (key) => {
  inputVisibleKey.value = key;
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}
const handleInputConfirm = (node) => {
  console.log('handleInputConfirm', node);
  if (inputVisibleKey.value) {
    node.data.dynamicTags.push(inputValue.value)
    // 需要把数据同步到后端接口
  }
  inputVisibleKey.value = '';
  inputValue.value = '';
}
const menu = ref({
  top: 0,
  left: 0,
});
const handleNodeContextmenu = (event, node, data) => {
  console.log('右键事件', data.key);
  editProjectNameVisibleKey.value = data.key;
  // menuVisible = true;
  // menu.value.top = event.clientY;
  // menu.value.left = event.clientX;
  // currentNode = tree.getNode(event);
  // nodeName = data.label;
}
const handleEditProjectNameConfirm = ({key}) => {
  const node = treeRef.value.getNode(key);
  node.data.identify = editProjectNameValue.value;
  editProjectNameVisibleKey.value = '';
  editProjectNameValue.value = '';
}
</script>

<template>
    <el-input
      v-model="filterText"
      style="width: 240px"
      placeholder="输入文件名或标签名过滤"
    />

    <!-- <el-link href="/" :underline="false"><el-button>首页</el-button></el-link> -->

    <div style="overflow-x: scroll;margin-top: 20px;">
      <el-tree
        ref = "treeRef"
        class = "filter-tree"
        :data = "loadDocuments"
        :props = "defaultProps"
        default-expand-all
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        node-key="id"
        @node-contextmenu="(event, node, data)=>handleNodeContextmenu(event, node, data)"
      >
        <template #default="{ node, data }">
          <div>
            <div v-if="editProjectNameVisibleKey != node.key" class="node-label">{{node.label }}</div>
            <el-input
              v-else 
              style="display: flex; min-width: 50px; width: auto"
              class="w-20"
              size="small"
              v-model="editProjectNameValue"
              @keyup.enter="handleEditProjectNameConfirm(node)"
            />
          </div>
          <div class="node-tag" style="overflow: visible;">
            <div class="flex gap-2" style="overflow: visible;">
              <el-tag
                v-for="tag in data.dynamicTags"
                :key="tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag, node)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisibleKey === node.key"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                style="width: 100px"
                size="small"
                @keyup.enter="handleInputConfirm(node)"
                @blur="handleInputConfirm(node)"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showInput(node.key)">
                + New Tag
              </el-button>
            </div>
          </div>

        </template>  
      </el-tree>
    </div>
</template>
<style>
.node-label {
  margin-right: 10px;
}
.el-tree-node__children {
  overflow: visible !important;
}
.el-tree-node__content {
  padding-top: 5px !important;
}
</style>