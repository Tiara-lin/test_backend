import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/beautyamy4/', // 替換成你的 repo 名稱
  plugins: [react()],
})
