import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Puerto fijo: el dashboard enlaza al orquestador, y sin esto se repartirían los puertos al azar.
  server: { port: 5173, strictPort: true },
  // jspdf solo se importa dinámicamente (al descargar el PDF): se pre-empaqueta al arrancar para que Vite no lo descubra tarde.
  optimizeDeps: { include: ['jspdf'] },
})
