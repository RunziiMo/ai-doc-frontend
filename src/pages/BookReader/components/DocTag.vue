<script setup>
import { reactive, ref, computed, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    dialogVisible: {
        type: Boolean,
        required: true,
    },
    handleBatchAppendTag: {
    },
    documents: {  
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['update:dialogVisible']);
const dialogFormVisible = computed({
    get() {
        return props.dialogVisible;  
    },
    set(newValue) {
        emit('update:dialogVisible', newValue);
    },
});

const defaultProps = {
    id: 'id',
    label: 'text',
}
const tagName = ref('');
const selectedKeys = ref([]);
const treeRef = ref(null);

function handleCheckChange (data, checked, indeterminate) {
    console.log('checked', checked, data);
    if (checked) {
        selectedKeys.value.push(data.id);
    } else {
        const index = selectedKeys.value.indexOf(data.id);
        if (index > -1) {
            selectedKeys.value.splice(index, 1);
        }
    }
}

function trimQuotes(str) {
  return str.replace(/^"|"$/g, '');
}

const batchDeleteTagsHandle = () => {
    console.log('tagName', trimQuotes(tagName.value));
    selectedKeys.value.forEach(key => {
        const node = treeRef.value.getNode(key);
        if (node) {
            const index = node.data.dynamicTags.indexOf(trimQuotes(tagName.value));
            if (index > -1) {
                node.data.dynamicTags.splice(index, 1);
            }
        }
    })
    tagName.value = '';
}

const handleCloseTag = (tag, nodeData) => {
    const node = treeRef.value.getNode(nodeData.key);
    if (node) {
        const index = node.data.dynamicTags.indexOf(trimQuotes(tag));
        if (index > -1) {
            node.data.dynamicTags.splice(index, 1);
        }
    }
}

const confirmBatchAppend = () => {
    props.handleBatchAppendTag(treeData);
}

const filterNode = (value, data) => {
    if (!value) return true
    return data.text.includes(value)
}

const handleNodeClick = (data) => {
  console.log("handleNodeClick:")
  console.log(data.id)
//   emit('updateDocId', data.id)
}

const appendTagsToNodes = (nodes, tagName) => {  
    nodes.forEach(node => {  
        // 检查当前节点的dynamicTags是否包含tagName  
        if (!node.data.dynamicTags.includes(tagName)) {  
            // 如果不包含，则添加tagName  
            node.data.dynamicTags.push(tagName);  
        }  

        // 如果当前节点有子节点，则递归处理子节点  
        if (node.children && node.children.length > 0) {  
            appendTagsToNodes(node.children, tagName);  
        }  
    });  
}

function addTagToSelectedNodes(treeData, tagName) {  
    treeData.forEach(node => {
        // 如果节点被选中，则添加标签
        if (treeRef.value.getCheckedNodes().includes(node)) {  
            if (!node.dynamicTags) {  
            node.dynamicTags = [];  
            }  
            if (!node.dynamicTags.includes(tagName)) {  
            node.dynamicTags.push(tagName);  
            }  
        }

        // 如果节点有子节点，则递归调用自身  
        if (node.children) {  
            addTagToSelectedNodes(node.children, tagName);  
        }
    });
  }

// 处理批量添加标签的点击事件
function batchAppendTagsHandle() {  
    // addTagToSelectedNodes(treeRef.value.getData(), tagName);  
    console.log('getCheckedKeys', treeRef.value.getCheckedKeys());
    treeRef.value.getCheckedKeys().forEach(key => {
        const node = treeRef.value.getNode(key);
        if (node && !node.data.dynamicTags.includes(tagName.value)) {
            node.data.dynamicTags.push(tagName.value);
        }
    })
    tagName.value = '';
}

watch(() => props.dialogVisible, (newVal) => {
    if (!newVal) {
        selectedKeys.value = [];
    }
})

function handlePreview() {}
function handleRemove() {}
function beforeRemove() {}
function handleExceed() {}
</script>

<template>
    <el-dialog v-model="dialogFormVisible" title="上传文档" :show-close="false">
        <div>
            <div class="input-tag-name">
                <el-input v-model="tagName" placeholder="输入标签名"></el-input>
                <el-button type="primary" class="add-text-btn" @click="batchAppendTagsHandle">批量添加标签</el-button>
                <el-button type="danger" class="add-text-btn" @click="batchDeleteTagsHandle">批量删除标签</el-button>
            </div>
            <div class="tree">
                <el-tree
                    ref="treeRef"
                    style="max-width: 600px"
                    class="filter-tree"
                    :data="documents"
                    :props="defaultProps"
                    default-expand-all
                    :filter-node-method="filterNode"
                    check-strictly
                    show-checkbox
                    @check-change="handleCheckChange"
                    node-key="id"
                >
                    <template #default="{ node, data }">
                        <div class="node-tag">
                            <span>{{node.label }}</span>
                            <div class="flex gap-2">
                                <el-tag
                                    v-for="tag in data.dynamicTags"
                                    :key="tag"
                                    closable
                                    :disable-transitions="false"
                                    @close="handleCloseTag(tag, node)"
                                >
                                    {{ tag }}
                                </el-tag>
                            </div>
                        </div>
                    </template>
                </el-tree>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="confirmBatchAppend">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style>
.input-tag-name {
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #cccccc;
    padding-bottom: 10px;
}
.tree {
    padding-top: 10px;
}
.node-tag {
    height: auto;
    display: flex;
    gap: 10px
    /* flex-direction: column;
    justify-content: flex-start; */
}
</style>