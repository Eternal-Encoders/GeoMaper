import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    strictPort: true,
    host: true,
    port: 3000,
  }
})
