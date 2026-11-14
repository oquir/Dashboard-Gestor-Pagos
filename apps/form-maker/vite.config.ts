import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Puerto fijo: el dashboard enlaza a FormMaker, y sin esto se repartirían los puertos al azar.
  server: { port: 5174, strictPort: true },
  // El preview usa el mismo puerto que dev, que es el que enlaza el dashboard.
  preview: { port: 5174, strictPort: true },
})
