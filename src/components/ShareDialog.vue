<template>
    <el-dialog v-model="dialogFormVisible" title="项目分享" width="500">
        <div class="flex justify-center">
            <el-image :src="`/qrcode/${book.identify}.png`"/>
        </div>
        <el-form class="mt-3" :model="form">
            <el-form-item label="项目地址">
                <el-input autocomplete="off" :value="`${baseUrl}/docs/${book.identify}`"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">
                关闭
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
const baseUrl = ref(window.location.origin)
const props = defineProps({  
    showDialog: {  
        type: Boolean, 
        required: true,
    },
    book: {
        type: Object, 
        required: true,
    },
});

const emit = defineEmits(['update:showDialog']);

const dialogFormVisible = computed({
    get() {
        return props.showDialog;  
    },
    set(newValue) {
        emit('update:showDialog', newValue);
    },
});

const formLabelWidth = '140px';

const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
});

</script>