import { useEffect, useRef, useState } from 'react'
import type { PdfViewerProps } from './PdfViewer.types'

/** Píxeles por punto de PDF: una hoja carta sale de 1224 px de ancho, nítida hasta el ancho máximo de la página. */
const SCALE = 2

/**
 * Páginas del PDF dibujadas con pdf.js, una debajo de otra, sin el visor del navegador ni sus botones. pdf.js se carga
 * solo cuando hace falta, como jsPDF.
 */
export default function PdfViewer({ pdf, title }: PdfViewerProps) {
  const pages = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = pages.current
    if (!container) return
    let cancelled = false
    let destroy: (() => Promise<void>) | undefined

    async function draw(target: HTMLDivElement) {
      const [{ getDocument, GlobalWorkerOptions }, { default: workerUrl }] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ])
      GlobalWorkerOptions.workerSrc = workerUrl
      const task = getDocument({ data: new Uint8Array(await pdf.arrayBuffer()) })
      destroy = () => task.destroy()
      const doc = await task.promise
      const ratio = window.devicePixelRatio || 1
      for (let n = 1; n <= doc.numPages && !cancelled; n++) {
        const page = await doc.getPage(n)
        const viewport = page.getViewport({ scale: SCALE * ratio })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.setAttribute('role', 'img')
        canvas.setAttribute('aria-label', `${title}, página ${n} de ${doc.numPages}`)
        canvas.className = 'mx-auto block h-auto w-full max-w-5xl bg-white shadow-md'
        if (cancelled) return
        target.append(canvas)
        await page.render({ canvas, viewport }).promise
      }
    }

    draw(container).catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
      container.replaceChildren()
      destroy?.()
    }
  }, [pdf, title])

  if (failed) {
    return <p className="py-8 text-center text-sm text-red-700">No se pudo mostrar el PDF.</p>
  }
  return <div ref={pages} className="flex flex-col gap-4" />
}
