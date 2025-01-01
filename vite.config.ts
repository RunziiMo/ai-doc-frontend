import { fileURLToPath, URL } from 'node:url'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    UnoCSS(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
      '/law_files': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api2/, ""),
      },
      '/static': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
      },
      '/aigc': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
      },
      '/captcha': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
      },
      '/book': {
        target: 'http://123.57.55.24:8181',
        changeOrigin: true,
      },
    },
  },
})
