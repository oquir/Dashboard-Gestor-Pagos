import { Document, DocumentDownload, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { downloadTemplate, readTemplate } from '../../../../lib'
import { useData } from '../../../../store'
import { Button, Card } from '../../../atoms'
import { Notice, CardHeader, FilePicker } from '../../../molecules'
import type { ActivityUploadProps } from './ActivityUpload.types'

/** Carga de las actividades de un año gravable: plantilla, Excel diligenciado, vista previa y confirmación. */
export default function ActivityUpload({
  municipalityId,
  fiscalYear,
  base,
  current,
  view,
  changeView,
}: ActivityUploadProps) {
  const loadActivities = useData((s) => s.loadActivities)
  const [errors, setErrors] = useState<string[]>([])
  const [loaded, setLoaded] = useState<string | null>(null)

  const read = async (file: File) => {
    setLoaded(null)
    const reading = await readTemplate(file)
    setErrors(reading.errors)
    changeView(reading.errors.length > 0 ? null : { file: file.name, rates: reading.rates })
  }

  const confirm = () => {
    if (!view) return
    loadActivities(municipalityId, fiscalYear, view.rates, view.file)
    setLoaded(`Se cargaron ${view.rates.length} actividades para el año gravable ${fiscalYear}.`)
    changeView(null)
  }

  return (
    <Card>
      <CardHeader
        title={`Cargar actividades de ${fiscalYear}`}
        description="Descarga la plantilla, llénala en Excel y cárgala. La carga reemplaza todas las actividades del año gravable."
      />
      <div className="space-y-4 p-5">
        <ol className="grid gap-4 sm:grid-cols-2">
          <li>
            <p className="mb-1 text-sm font-medium text-slate-700">1. Descarga la plantilla</p>
            <Button onClick={() => downloadTemplate(fiscalYear, base?.rates ?? [])}>
              <DocumentDownload className="size-4" aria-hidden /> Descargar plantilla
            </Button>
            <p className="mt-1 text-xs text-slate-500">
              {base
                ? `Trae las ${base.rates.length} actividades de ${base.fiscalYear} para que ajustes lo que cambió.`
                : 'Viene vacía, solo con los encabezados.'}
            </p>
          </li>
          <li>
            <p className="mb-1 text-sm font-medium text-slate-700">
              2. Carga el Excel diligenciado
            </p>
            <FilePicker
              text="Elegir archivo .xlsx"
              accept=".xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void read(file)
              }}
            />
          </li>
        </ol>

        {errors.length > 0 && (
          <Notice tone="danger" role="alert">
            <p className="font-medium">No se cargó el archivo. Corrígelo y vuelve a cargarlo:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Notice>
        )}

        {view && (
          <div
            role="status"
            className="flex flex-wrap items-center gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800"
          >
            <Document className="size-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              <span className="font-medium">{view.file}</span> trae {view.rates.length} actividades.
              Revísalas abajo; al confirmar
              {current
                ? ` reemplazan las ${current.rates.length} cargadas`
                : ' quedan cargadas'}{' '}
              para el año gravable {fiscalYear}.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => changeView(null)}>Cancelar</Button>
              <Button variant="primary" onClick={confirm}>
                Confirmar carga
              </Button>
            </div>
          </div>
        )}

        {loaded && (
          <Notice tone="success" icon={TickCircle} role="status">
            <p className="font-medium">{loaded}</p>
          </Notice>
        )}
      </div>
    </Card>
  )
}
