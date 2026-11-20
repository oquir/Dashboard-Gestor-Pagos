import { ArrowUpRightSquare, Download, Maximize, Minimize } from 'reicon-react'
import { useEffect, useState } from 'react'
import { declarationBlob, downloadBlob } from '../../../../lib'
import { useData } from '../../../../store'
import { Modal, MODAL_ICON_BUTTON_CLASS } from '../../../molecules'
import PdfViewer from '../PdfViewer'
import { OPEN_URL_LIFETIME } from './PdfPreviewModal.constants'
import type { PdfPreviewModalProps } from './PdfPreviewModal.types'

/**
 * Vista previa de la copia de la declaración, dibujada sin el visor del navegador. Se puede ampliar a toda la ventana,
 * abrir en otra pestaña o descargar.
 */
export default function PdfPreviewModal(props: PdfPreviewModalProps) {
  const {
    d,
    blob,
    title,
    description,
    fileName,
    showOpen = true,
    showDownload = true,
    close,
  } = props
  const [resolved, setResolved] = useState<{ source: typeof blob | typeof d; pdf: Blob }>()
  const [expanded, setExpanded] = useState(false)

  const source = blob ?? d

  useEffect(() => {
    if (!source || blob instanceof Blob) return
    let cancelled = false
    const promise = blob
      ? Promise.resolve(blob)
      : d
        ? declarationBlob(d, useData.getState())
        : undefined
    promise?.then((result) => {
      if (!cancelled) setResolved({ source, pdf: result })
    })
    return () => {
      cancelled = true
    }
  }, [source, blob, d])

  const pdf = blob instanceof Blob ? blob : resolved?.source === source ? resolved.pdf : undefined

  const openInNewWindow = () => {
    if (!pdf) return
    const url = URL.createObjectURL(pdf)
    window.open(url, '_blank')
    // La pestaña nueva necesita la URL mientras carga; después se libera.
    setTimeout(() => URL.revokeObjectURL(url), OPEN_URL_LIFETIME)
  }

  const heading = title ?? (d ? `Factura N.º ${d.invoiceNumber}` : 'Vista previa')
  const details = description ?? (d ? `Declaración ${d.number} · ${d.taxpayer.name}` : undefined)
  const downloadName = fileName ?? (d ? `${d.number}.pdf` : 'documento.pdf')
  const sizeLabel = expanded ? 'Reducir' : 'Ampliar'
  const SizeIcon = expanded ? Minimize : Maximize

  return (
    <Modal
      size={expanded ? 'full' : 'xl'}
      title={heading}
      description={details}
      close={close}
      actions={
        <>
          <button
            type="button"
            aria-label={sizeLabel}
            title={sizeLabel}
            onClick={() => setExpanded(!expanded)}
            className={MODAL_ICON_BUTTON_CLASS}
          >
            <SizeIcon className="size-5" aria-hidden />
          </button>
          {showOpen && (
            <button
              type="button"
              aria-label="Abrir en otra ventana"
              title="Abrir en otra ventana"
              onClick={openInNewWindow}
              disabled={!pdf}
              className={`${MODAL_ICON_BUTTON_CLASS} disabled:opacity-40`}
            >
              <ArrowUpRightSquare className="size-5" aria-hidden />
            </button>
          )}
          {showDownload && (
            <button
              type="button"
              aria-label="Descargar"
              title="Descargar"
              onClick={() => pdf && downloadBlob(pdf, downloadName)}
              disabled={!pdf}
              className={`${MODAL_ICON_BUTTON_CLASS} disabled:opacity-40`}
            >
              <Download className="size-5" aria-hidden />
            </button>
          )}
        </>
      }
    >
      <div
        className={`${expanded ? 'h-full' : 'h-[75vh]'} overflow-auto rounded-lg bg-surface-raised p-4`}
      >
        {pdf ? (
          <PdfViewer pdf={pdf} title={d ? `Declaración ${d.number}` : heading} />
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-fg-muted">
            Generando PDF…
          </p>
        )}
      </div>
    </Modal>
  )
}
