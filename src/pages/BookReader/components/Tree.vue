<template>
    <div>
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
    </div>
</template>