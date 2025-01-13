import { ClickOutside } from 'element-plus'
import type { App } from 'vue'

export default {
  install(Vue: App) {
    Vue.directive('ClickOutside', ClickOutside)
  },
}
