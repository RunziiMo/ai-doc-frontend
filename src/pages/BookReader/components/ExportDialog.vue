<template>
  <el-dialog v-model="dialogFormVisible" title="对话导出">
    <div ref="contentToCopy" style="height: 500px; overflow: auto">
      <div ref="messagesRef">
        <ExportMessage v-for="m in messages" :message="m" :document="document" />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false"> 关闭 </el-button>
        <el-button type="primary" @click="copyToClipboard"> 复制 </el-button>
        <el-button type="primary" @click="handleExportWord"> word导出 </el-button>
        <el-button type="primary" @click="handleExportPdf"> pdf导出 </el-button>
        <el-button type="primary" @click="handleExportTxt"> txt导出 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, inject, type Ref, type PropType } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { ElMessage } from 'element-plus'
import { exportToTxt, exportWord } from '@/utils/file'
import jsPDF from 'jspdf'
import '@/assets/js/SIMHEI-normal.js'
import ExportMessage from './ExportMessage.vue'

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  document: {
    type: Object,
    required: true,
  },
  messages: {
    type: Array as PropType<any[]>,
    required: true,
  },
})

const renderer = new marked.Renderer()
renderer.code = (code, language) => {
  const validLang = hljs.getLanguage(language) ? language : 'plaintext'
  const highlightedCode = hljs.highlight(code, { language: validLang }).value
  return `<div class="code-header hljs ${validLang}">
        </div>
        <pre class="hljs ${validLang}"><code class="code-body">${highlightedCode}</code>
    </pre>`
}
renderer.table = (header, body) => {
  return `<table class="el-table chat-response-table">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
    </table>`
}
marked.setOptions({ renderer })

const checkedMessages = inject<Ref<string>>('checkedMessages')
// const checkMessage = inject('checkMessage')
const messages = computed(() =>
  props.messages.filter((item) => checkedMessages.value.includes(item.message_id)),
)

const contentToCopy = ref()
const messagesRef = ref()

// const convertToJSON = (message) => {
//   const sections = message.split(/\d+\.\s\*\*(.+?)\*\*：/).filter(Boolean)
//   console.log(sections)
//   const json = {}

//   for (let i = 0; i < sections.length; i += 2) {
//     console.log(sections[i])
//     const sectionTitle = sections[i].trim()
//     const sectionContent = sections[i + 1].trim()
//     json[sectionTitle] = parseContent(sectionContent)
//   }
//   return JSON.stringify(json, null, 2)
// }

// const parseContent = (content) => {
//   const lines = content.split('\n').filter((line) => line.trim())
//   const result: any = {}

//   lines.forEach((line) => {
//     const keyValueMatch = line.match(/- (.+?)：(.+)/)
//     if (keyValueMatch) {
//       result[keyValueMatch[1].trim()] = keyValueMatch[2].trim()
//     } else {
//       // If the line does not match key-value pair format, we might want to process it differently
//       // Here, we are just adding it as a text to a "details" key, you can adjust this logic based on your need
//       if (!result.details) {
//         result.details = []
//       }
//       result.details.push(line.trim())
//     }
//   })

//   // If 'details' exists and has only one item, unnest it for simplicity
//   if (result.details && result.details.length === 1) {
//     result.details = result.details[0]
//   }

//   return result
// }

const copyToClipboard = () => {
  const content = contentToCopy.value
  if (content) {
    // Create a range and select the content
    const range = document.createRange()
    range.selectNodeContents(content)

    // Get the selection object and remove any existing selections
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    // Copy the selected content to the clipboard
    try {
      document.execCommand('copy')
      ElMessage.success('已复制到剪贴板！')
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
    // Remove the selection
    selection.removeAllRanges()
  }
  dialogFormVisible.value = false
}

const emit = defineEmits(['update:showDialog'])

const dialogFormVisible = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emit('update:showDialog', newValue)
  },
})

const handleExportWord = () => {
  exportWord(contentToCopy.value, props.document.doc_name)
}

const handleExportPdf = () => {
  const pdf = new jsPDF()

  const pageWidth = pdf.internal.pageSize.width - 20
  const lineHeight = 10

  let currentY = 10
  let currentPage = 1

  const lines = pdf.splitTextToSize(contentToCopy.value.textContent, pageWidth)

  for (let i = 0; i < lines.length; i++) {
    if (currentY + lineHeight > pdf.internal.pageSize.height) {
      // 如果当前行的位置超过了页面高度，添加新的一页
      pdf.addPage()
      currentY = 10
      currentPage++
    }
    pdf.text(lines[i], 10, currentY)
    currentY += lineHeight
  }
  pdf.save(`${props.document.doc_name}.pdf`)
}

const handleExportTxt = () => {
  exportToTxt(contentToCopy.value.textContent, `${props.document.doc_name}.txt`)
}
</script>

<style scoped>
.hljs {
  overflow-x: scroll;
}
.chat-response-table {
  width: 100%;
  overflow-x: scroll;
}
.code-header {
  display: flex;
  justify-content: space-between;
}
</style>
