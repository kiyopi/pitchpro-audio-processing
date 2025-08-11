import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        core: resolve(__dirname, 'src/core/index.ts'),
        advanced: resolve(__dirname, 'src/advanced/index.ts'),
        utils: resolve(__dirname, 'src/utils/index.ts')
      },
      name: 'PitchPro',
      fileName: (format, entryName) => {
        if (format === 'es') {
          return `${entryName}.esm.js`
        }
        return `${entryName}.js`
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['pitchy'],
      output: {
        globals: {
          pitchy: 'Pitchy'
        }
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
    postcss: false
  }
})