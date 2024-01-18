// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dsv from '@rollup/plugin-dsv';

export default defineConfig({
  plugins: [
    vue(),
    dsv(), // Add the dsv plugin
  ],
})
