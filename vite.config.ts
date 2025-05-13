import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 如果你的 repo 名稱是 my-project
export default defineConfig({
  base: '/beautyamy/',
  plugins: [react()]
});
