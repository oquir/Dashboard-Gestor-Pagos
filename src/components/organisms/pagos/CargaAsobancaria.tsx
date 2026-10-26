import { Document, DocumentUpload, TickCircle } from 'reicon-react'
import { useEffect, useRef, useState } from 'react'
import { fechaDeRecaudo } from '../../../lib/asobancaria'
import { formatoFecha, formatoPesos } from '../../../lib/formato'
import { Boton, Card } from '../../atoms'
import { Aviso, CardHeader, SelectorArchivo } from '../../molecules'

const PASOS = ['Leyendo el archivo…', 'Validando el formato Asobancaria 2001…', 'Cruzando las referencias con los números de factura…']
const DURACION_MS = 2500

interface Resultado {
  archivo: string
  /** La del encabezado del archivo; undefined si no la trae. */
  fecha?: string
  pagos: number
  totales: number
  valor: number
  sinCruce: number
}

/** Resultado de prueba: en la demo del archivo solo se lee la fecha; el cruce se simula. */
function simular(archivo: string, fecha: string | undefined): Resultado {
  const pagos = 4 + Math.floor(Math.random() * 15)
  return {
    archivo,
    fecha,
    pagos,
    totales: pagos - Math.floor(Math.random() * (pagos / 3)),
    valor: (20 + Math.floor(Math.random() * 400)) * 100_000,
    sinCruce: Math.floor(Math.random() * 3),
  }
}

/**
 * Los pagos con código de barras no los notifica el banco: el municipio carga el archivo
 * de recaudo de cada día y sus referencias se cruzan con los números de factura.
 */
export default function CargaAsobancaria() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [avance, setAvance] = useState<number | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const temporizador = useRef<number>(undefined)
  useEffect(() => () => clearInterval(temporizador.current), [])

  const cargar = async () => {
    if (!archivo) return
    setResultado(null)
    setAvance(0)
    const final = simular(archivo.name, fechaDeRecaudo(await archivo.text()))
    const inicio = Date.now()
    temporizador.current = window.setInterval(() => {
      const transcurrido = Math.min((Date.now() - inicio) / DURACION_MS, 1)
      setAvance(transcurrido)
      if (transcurrido < 1) return
      clearInterval(temporizador.current)
      setAvance(null)
      setArchivo(null)
      setResultado(final)
    }, 100)
  }

  const cargando = avance !== null

  return (
    <Card>
      <CardHeader
        titulo="Cargar Asobancaria 2001"
        descripcion="Para los pagos con código de barras, que el banco no notifica. Se carga un archivo por día de recaudo (la fecha viene en el archivo) y se cruza con los números de factura."
      />
      <div className="space-y-4 p-5">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Archivo</p>
          {archivo ? (
            <p className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
              <Document className="size-4 shrink-0 text-brand-600" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{archivo.name}</span>
              {!cargando && (
                <button type="button" onClick={() => setArchivo(null)} className="shrink-0 text-xs text-slate-500 hover:text-red-600">
                  Quitar
                </button>
              )}
            </p>
          ) : (
            <SelectorArchivo
              texto="Elegir archivo"
              accept=".txt"
              onChange={(e) => {
                setArchivo(e.target.files?.[0] ?? null)
                setResultado(null)
                e.target.value = ''
              }}
            />
          )}
        </div>

        {cargando && (
          <div role="status">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600 transition-[width] duration-100" style={{ width: `${avance * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{PASOS[Math.min(Math.floor(avance * PASOS.length), PASOS.length - 1)]}</p>
          </div>
        )}

        {resultado && (
          <Aviso tono="exito" icono={TickCircle} rol="status">
            <p className="font-medium">
              Se cargó {resultado.archivo}
              {resultado.fecha && `, con el recaudo del ${formatoFecha(resultado.fecha)}`}.
            </p>
            <p className="mt-0.5">
              Se identificaron {resultado.pagos} pagos por {formatoPesos(resultado.valor)}: {resultado.totales} totales y{' '}
              {resultado.pagos - resultado.totales} parciales.
              {resultado.sinCruce > 0 && ` ${resultado.sinCruce} referencias no coinciden con ningún número de factura.`}
            </p>
          </Aviso>
        )}

        <Boton variante="primario" disabled={!archivo || cargando} onClick={cargar}>
          <DocumentUpload className="size-4" aria-hidden /> {cargando ? 'Cargando…' : 'Cargar archivo'}
        </Boton>
      </div>
    </Card>
  )
}
