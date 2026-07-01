import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Esto le dice a Vite que asegure que el punto de entrada es correcto
      input: 'index.html',
    },
  },
})
