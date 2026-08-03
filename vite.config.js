import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths so the build works whether it's served from the
  // domain root (local preview) or a GitHub Pages project subpath.
  base: './',
  plugins: [react()],
})
