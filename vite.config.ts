import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PitchPro',
      fileName: (format) => {
        if (format === 'umd') {
          return 'pitchpro.umd.js'
        }
        if (format === 'es') {
          return 'pitchpro.esm.js'
        }
        return 'pitchpro.cjs.js'
      },
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
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
    postcss: {}
  }
})