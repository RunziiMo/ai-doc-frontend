<template>
    <el-dialog v-model="dialogFormVisible" title="上传文档" :before-close="handleClose" style="width: 435px">
        <div>
            <el-upload
                v-model:file-list="form.file"
                class="upload-file"
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                multiple
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                :limit="1"
                :on-exceed="handleExceed"
            >
                <el-input placeholder="请选择Zip或者Docx文件" style="width: 400px">
                    <template #append>
                        <el-button type="primary">选择</el-button>
                    </template>
                </el-input>
                
                <!-- <template #tip>
                <div class="el-upload__tip">
                    jpg/png files with a size less than 500KB.
                </div>
                </template> -->
            </el-upload>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary">上传</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { reactive, computed } from 'vue';
import axios from 'axios';

const props = defineProps(['dialogVisible']);
const form = reactive({
    file: '',
})

const emit = defineEmits(['update:dialogVisible']);
const dialogFormVisible = computed({
    get() {
        return props.dialogVisible;  
    },
    set(newValue) {
        emit('update:dialogVisible', newValue);
    },
});

function handlePreview() {}
function handleRemove() {}
function beforeRemove() {}
function handleExceed() {}
</script>