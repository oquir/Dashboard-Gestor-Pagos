import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Puerto fijo: el dashboard enlaza al orquestador, y sin esto se repartirían los puertos al azar.
  server: { port: 5173, strictPort: true },
  // El preview usa los mismos puertos que dev: el enlace al orquestador apunta a :5174 y, con el
  // 4173 por defecto de los dos, el segundo se correría a otro puerto y el enlace quedaría roto.
  preview: { port: 5173, strictPort: true },
  // jspdf solo se importa dinámicamente (al descargar el PDF): se pre-empaqueta al arrancar para que Vite no lo descubra tarde.
  optimizeDeps: { include: ['jspdf'] },
})
