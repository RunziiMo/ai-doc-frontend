import { createApp } from 'vue'
import { marked } from 'marked'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import '@/api/interceptor'
import router from './router'
import App from './App.vue'

const renderer = {
  text(text) {
    if (!text.includes('【依据】')) {
      return false
    }
    const replacedText = text.replace(/(.*)【依据】(.*)/, (before, after) => {
      return `<a style="cursor: pointer;" title="${after}">${before}</a>`
    })
    return replacedText
  },
}
marked.use({ renderer })
const options = {
  gfm: true, // 开启 GitHub Flavored Markdown（GFM）
  breaks: true,
  headerIds: false, // 禁止为标题自动生成 ID
  // 还可以添加其他自定义参数...
}
marked.use(options)

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router)
app.mount('#app')
