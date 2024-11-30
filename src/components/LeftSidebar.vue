<template>
    <div class="flex justify-between">
        <el-input
            v-model="filterText"
            style="width: 180px"
            placeholder="输入文件名或标签名过滤"
        />
        <!-- <el-button @click="handleCheckAll">{{ checkAallText }}</el-button> -->
    </div>
    <div style="overflow-x: scroll;margin-top: 20px;">
        <el-tree
          ref="treeRef"
          class="filter-tree"
          :data="documents"
          :props="defaultProps"
          default-expand-all
          :filter-node-method="filterNode"
          node-key="id"
          @node-contextmenu="(event, node, data)=>handleNodeContextmenu(event, node, data)"
          @check-change="handleCheckChange"
        >
            <template #default="{ node, data }">
                <div
                    v-if="editProjectNameVisibleKey != node.key"
                    class="node-label"
                    @click="handleNodeClick(data)">
                    {{ node.label }}
                </div>
                <template  v-else >
                    <el-input
                        style="display: flex; min-width: 50px; width: auto"
                        class="w-20"
                        size="small"
                        v-model="editProjectNameValue"
                        @keyup.enter="handleEditDocNameConfirm(node, data)"
                    />
                    <el-button
                        @click="handleEditDocNameConfirm(node, data)"
                        class="ml-1"
                        :icon="Check"
                        size="small"
                        circle/>
                </template>
              
                <el-button
                    v-if="editProjectNameVisibleKey == node.key"
                    @click="handleDocDelete(data)"
                    class="!ml-1"
                    type="danger"
                    :icon="Delete"
                    size="small"
                    circle/>
              
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
                        <!-- <el-input
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
                        </el-button> -->
                    </div>
                </div>

            </template>  
        </el-tree>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, computed, PropType } from 'vue'
import axios from 'axios';
import { Delete, Check } from '@element-plus/icons-vue'
import { ElTree, ElInput, ElMessage } from 'element-plus'

const emit = defineEmits(['updateDocId', 'deleteDocId']);

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
const checkedKeys = defineModel('checkedKeys', {
    type: Array as PropType<string[]>
})

const defaultProps = {
    id: 'id',
    label: 'text',
}

const allkeys = computed(() => {
    return props.documents.map(( el: any ) => el.id)
})

const checkAallText = computed(() => {
    if(allkeys.value.length === checkedKeys.value.length) {
        return '取消全选'
    }
    return '全选'
})

const setCheckKeys = (val?: string[]) => {
    treeRef.value.setCheckedKeys(val)
    checkedKeys.value = val;
}

watch(() => checkedKeys.value, (val) => [
    setCheckKeys(checkedKeys.value)
])
nextTick(()=> [
    setCheckKeys(checkedKeys.value)
])


const getCheckKeys = () => {
   return treeRef.value.getCheckedKeys() || []
}

const handleCheckAll = () => {
    const keys = getCheckKeys();
    if(keys.length === props.documents.length) {
        // 全选
        setCheckKeys([])
    } else {
        setCheckKeys(allkeys.value)
    }
}

const filterNode = (value: string, data: Tree) => {
    if (!value) return true
    return data.text.includes(value) || (data.dynamicTags && data.dynamicTags.some(item => item.indexOf(value) > -1));
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})


const handleNodeClick = (data: Tree) => {
    setCheckKeys([data.id])
    emit('updateDocId', data.id)
}

const handleDocDelete = (data: Tree) => {
    const formData = new FormData()
    formData.append('doc_id', data.id);
    axios.post(`/api/${props.book.identify}/delete`, formData) // 替换为实际的API地址  
        .then(response => {
            if (response.data.errcode == 0) {
                ElMessage.success(response.data.message);
                emit('deleteDocId', data.id)
            } else {
                ElMessage.error('文档删除失败: ' + response.data.message);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
            ElMessage.error('请求失败，请稍后再试');
        });
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
    editProjectNameValue.value = node.text;
    // menuVisible = true;
    // menu.value.top = event.clientY;
    // menu.value.left = event.clientX;
    // currentNode = tree.getNode(event);
    // nodeName = data.label;
}
const handleEditDocNameConfirm = (key, data) => {
    const formData = new FormData()
    formData.append('doc_name', editProjectNameValue.value);
    formData.append('doc_id', data.id);
    axios.post(`/api/${props.book.identify}/create`, formData)
        .then(response => {
            if (response.data.errcode == 0) {
                ElMessage.success(response.data.message);
                const node = treeRef.value.getNode(key);
                node.data.text = editProjectNameValue.value;
                editProjectNameVisibleKey.value = '';
                editProjectNameValue.value = '';
            } else {
                ElMessage.error('文档修改失败: ' + response.data.message);
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
            ElMessage.error('请求失败，请稍后再试');
        });
}

const handleCheckChange = (data, checked) => {
    if(checked) {
        if(!checkedKeys.value.includes(data.id)) {
            checkedKeys.value.push(data.id)
        }
    } else {
        if(checkedKeys.value.includes(data.id)) {
            checkedKeys.value.splice(checkedKeys.value.indexOf(data.id), 1)
        }
    }
}
</script>

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