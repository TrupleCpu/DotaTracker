// electron.vite.config.ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    envPrefix: ['MAIN_VITE_', 'STRATZ_']
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [svelte(), tailwindcss()],
    define: {
      __BUILD_DATE__: JSON.stringify(
        /* @__PURE__ */ new Date().toISOString().slice(0, 10).replace(/-/g, '')
      )
    }
  }
})
export { electron_vite_config_default as default }
