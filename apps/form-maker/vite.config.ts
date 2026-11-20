import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Las dependencias que solo importan los chunks perezosos (PdfDesigner -> sonner, ScriptEditor ->
  // CodeMirror) se empaquetan al arrancar: sin esto la primera vez que se abria el diseñador de PDF
  // o la pestaña Logica, Vite respondia 504 "Outdated Optimize Dep" y el import dinamico fallaba
  // ("Failed to fetch dynamically imported module"). Si un chunk perezoso suma una dependencia que
  // el resto no usa, va aca.
  optimizeDeps: {
    include: [
      'sonner',
      '@codemirror/autocomplete',
      '@codemirror/commands',
      '@codemirror/lang-javascript',
      '@codemirror/language',
      '@codemirror/lint',
      '@codemirror/state',
      '@codemirror/view',
      '@lezer/highlight',
    ],
  },
  // Puerto fijo: el dashboard enlaza a FormMaker, y sin esto se repartirían los puertos al azar.
  server: { port: 5174, strictPort: true },
  // El preview usa el mismo puerto que dev, que es el que enlaza el dashboard.
  preview: { port: 5174, strictPort: true },
})
