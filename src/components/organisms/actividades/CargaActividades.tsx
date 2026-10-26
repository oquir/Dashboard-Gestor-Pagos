import { Document, DocumentDownload, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { descargarPlantilla, leerPlantilla } from '../../../lib/plantillaActividades'
import { useDatos } from '../../../store'
import type { ActividadesVigencia, Tarifa } from '../../../types'
import { Boton, Card } from '../../atoms'
import { Aviso, CardHeader, SelectorArchivo } from '../../molecules'

/** Tarifas leídas del Excel que aún no se han confirmado. */
export interface VistaPrevia {
  archivo: string
  tarifas: Tarifa[]
}

/** Carga de las actividades de un año gravable: plantilla, Excel diligenciado, vista previa y confirmación. */
export default function CargaActividades({ municipioId, vigencia, base, actual, vista, cambiarVista }: {
  municipioId: string
  vigencia: number
  /** Las actividades con que viene la plantilla. */
  base?: ActividadesVigencia
  /** Las ya cargadas para el año, que la carga reemplaza. */
  actual?: ActividadesVigencia
  vista: VistaPrevia | null
  cambiarVista: (vista: VistaPrevia | null) => void
}) {
  const cargarActividades = useDatos((s) => s.cargarActividades)
  const [errores, setErrores] = useState<string[]>([])
  const [cargada, setCargada] = useState<string | null>(null)

  const leer = async (archivo: File) => {
    setCargada(null)
    const lectura = await leerPlantilla(archivo)
    setErrores(lectura.errores)
    cambiarVista(lectura.errores.length > 0 ? null : { archivo: archivo.name, tarifas: lectura.tarifas })
  }

  const confirmar = () => {
    if (!vista) return
    cargarActividades(municipioId, vigencia, vista.tarifas, vista.archivo)
    setCargada(`Se cargaron ${vista.tarifas.length} actividades para el año gravable ${vigencia}.`)
    cambiarVista(null)
  }

  return (
    <Card>
      <CardHeader
        titulo={`Cargar actividades de ${vigencia}`}
        descripcion="Descarga la plantilla, llénala en Excel y cárgala. La carga reemplaza todas las actividades del año gravable."
      />
      <div className="space-y-4 p-5">
        <ol className="grid gap-4 sm:grid-cols-2">
          <li>
            <p className="mb-1 text-sm font-medium text-slate-700">1. Descarga la plantilla</p>
            <Boton onClick={() => descargarPlantilla(vigencia, base?.tarifas ?? [])}>
              <DocumentDownload className="size-4" aria-hidden /> Descargar plantilla
            </Boton>
            <p className="mt-1 text-xs text-slate-500">
              {base ? `Trae las ${base.tarifas.length} actividades de ${base.vigencia} para que ajustes lo que cambió.` : 'Viene vacía, solo con los encabezados.'}
            </p>
          </li>
          <li>
            <p className="mb-1 text-sm font-medium text-slate-700">2. Carga el Excel diligenciado</p>
            <SelectorArchivo
              texto="Elegir archivo .xlsx"
              accept=".xlsx"
              onChange={(e) => {
                const archivo = e.target.files?.[0]
                e.target.value = ''
                if (archivo) void leer(archivo)
              }}
            />
          </li>
        </ol>

        {errores.length > 0 && (
          <Aviso tono="peligro" rol="alert">
            <p className="font-medium">No se cargó el archivo. Corrígelo y vuelve a cargarlo:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {errores.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Aviso>
        )}

        {vista && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <Document className="size-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              <span className="font-medium">{vista.archivo}</span> trae {vista.tarifas.length} actividades. Revísalas abajo; al confirmar
              {actual ? ` reemplazan las ${actual.tarifas.length} cargadas` : ' quedan cargadas'} para el año gravable {vigencia}.
            </p>
            <div className="flex gap-2">
              <Boton onClick={() => cambiarVista(null)}>Cancelar</Boton>
              <Boton variante="primario" onClick={confirmar}>
                Confirmar carga
              </Boton>
            </div>
          </div>
        )}

        {cargada && (
          <Aviso tono="exito" icono={TickCircle} rol="status">
            <p className="font-medium">{cargada}</p>
          </Aviso>
        )}
      </div>
    </Card>
  )
}
