<template>
    <el-dialog v-model="props.dialogVisible" title="上传文档" :before-close="handleClose" style="width: 435px">
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
                <el-button @click="handleClose">取消</el-button>
                <el-button @click="handleClose" type="primary">上传</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
// const dialogVisible = ref(false)
const props = defineProps(['dialogVisible', 'handleClose']);
const form = reactive({
  file: '',
})

function handleClose() {
    props.handleClose();
}
function handlePreview() {}
function handleRemove() {}
function beforeRemove() {}
function handleExceed() {}
</script>