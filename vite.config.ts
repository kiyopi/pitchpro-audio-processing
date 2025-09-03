import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PitchPro',
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js'
        if (format === 'umd') return 'index.umd.js'
        return 'index.js'
      },
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      // pitchyをバンドルに含める
    },
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/advanced': resolve(__dirname, 'src/advanced'),
      '@/utils': resolve(__dirname, 'src/utils')
    }
  },
  css: {
    postcss: false
  }
})