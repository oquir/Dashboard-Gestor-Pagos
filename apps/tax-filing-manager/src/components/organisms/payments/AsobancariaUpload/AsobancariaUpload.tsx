import { Document, DocumentUpload, TickCircle } from 'reicon-react'
import { useEffect, useRef, useState } from 'react'
import { collectionDate, formatDate, formatPesos } from '../../../../lib'
import { Button, Card } from '../../../atoms'
import { Notice, CardHeader, FilePicker } from '../../../molecules'
import { DURATION_MS, STEPS } from './AsobancariaUpload.constants'
import type { Result } from './AsobancariaUpload.types'
import { simulate } from './AsobancariaUpload.utils'

/**
 * Los pagos con código de barras no los notifica el banco: el municipio carga el archivo
 * de recaudo de cada día y sus referencias se cruzan con los números de factura.
 */
export default function AsobancariaUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const timer = useRef<number>(undefined)
  useEffect(() => () => clearInterval(timer.current), [])

  const load = async () => {
    if (!file) return
    setResult(null)
    setProgress(0)
    const final = simulate(file.name, collectionDate(await file.text()))
    const start = Date.now()
    timer.current = window.setInterval(() => {
      const elapsed = Math.min((Date.now() - start) / DURATION_MS, 1)
      setProgress(elapsed)
      if (elapsed < 1) return
      clearInterval(timer.current)
      setProgress(null)
      setFile(null)
      setResult(final)
    }, 100)
  }

  const loading = progress !== null

  return (
    <Card>
      <CardHeader
        title="Cargar Asobancaria 2001"
        description="Para los pagos con código de barras, que el banco no notifica. Se carga un archivo por día de recaudo (la fecha viene en el archivo) y se cruza con los números de factura."
      />
      <div className="space-y-4 p-5">
        <div>
          <p className="mb-1 text-sm font-medium text-fg">Archivo</p>
          {file ? (
            <p className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg ring-1 ring-border">
              <Document className="size-4 shrink-0 text-brand-fg" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              {!loading && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="shrink-0 text-xs text-fg-muted hover:text-danger"
                >
                  Quitar
                </button>
              )}
            </p>
          ) : (
            <FilePicker
              text="Elegir archivo"
              accept=".txt"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setResult(null)
                e.target.value = ''
              }}
            />
          )}
        </div>

        {loading && (
          <div role="status">
            <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-fg-muted">
              {STEPS[Math.min(Math.floor(progress * STEPS.length), STEPS.length - 1)]}
            </p>
          </div>
        )}

        {result && (
          <Notice tone="success" icon={TickCircle} role="status">
            <p className="font-medium">
              Se cargó {result.file}
              {result.date && `, con el recaudo del ${formatDate(result.date)}`}.
            </p>
            <p className="mt-0.5">
              Se identificaron {result.payments} pagos por {formatPesos(result.value)}:{' '}
              {result.totals} totales y {result.payments - result.totals} parciales.
              {result.withoutCrossCheck > 0 &&
                ` ${result.withoutCrossCheck} referencias no coinciden con ningún número de factura.`}
            </p>
          </Notice>
        )}

        <Button variant="primary" disabled={!file || loading} onClick={load}>
          <DocumentUpload className="size-4" aria-hidden />{' '}
          {loading ? 'Cargando…' : 'Cargar archivo'}
        </Button>
      </div>
    </Card>
  )
}
