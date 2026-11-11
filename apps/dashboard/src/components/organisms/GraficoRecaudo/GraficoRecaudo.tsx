import { useMemo, useState } from 'react'
import { etiquetaImpuesto, formatoCompacto, formatoPesos } from '../../../lib/formato'
import { totalRecaudo } from '../../../utils'
import { Boton, Card } from '../../atoms'
import { CardHeader } from '../../molecules'
import Tabla from '../Tabla'
import { ALTO, SERIES, TODOS } from './constants'
import type { GraficoRecaudoProps, SegmentoActivo } from './types'
import { columnasTabla, maximoRedondo } from './utils'

/** Columnas apiladas: recaudo por periodo, una serie por impuesto. */
export default function GraficoRecaudo({ titulo, descripcion, filas, impuestos = TODOS, controles }: GraficoRecaudoProps) {
  const series = useMemo(() => SERIES.filter((s) => impuestos.includes(s.impuesto)), [impuestos])
  const columnas = useMemo(() => columnasTabla(series), [series])
  const [verTabla, setVerTabla] = useState(false)
  const [activo, setActivo] = useState<SegmentoActivo | null>(null)
  const maximo = maximoRedondo(Math.max(...filas.map(totalRecaudo), 0))
  const marcas = [maximo, maximo / 2, 0]

  return (
    <Card>
      <CardHeader
        titulo={titulo}
        descripcion={descripcion}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            {controles}
            <Boton variante="secundario" onClick={() => setVerTabla((v) => !v)}>
              {verTabla ? 'Ver gráfica' : 'Ver como tabla'}
            </Boton>
          </div>
        }
      />
      <div className="px-5 pb-5 pt-4">
        <ul className="mb-4 flex flex-wrap gap-4 text-sm text-slate-600">
          {series.map(({ impuesto, clase }) => (
            <li key={impuesto} className="flex items-center gap-2">
              <span className={`size-3 rounded-sm ${clase}`} aria-hidden />
              {etiquetaImpuesto[impuesto]}
            </li>
          ))}
        </ul>

        {verTabla ? (
          <div className="-mx-5">
            <Tabla datos={filas} columnas={columnas} densa idFila={(f) => f.etiqueta} />
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative w-14 shrink-0 text-right text-xs tabular-nums text-slate-400" style={{ height: ALTO }}>
              {marcas.map((m, i) => (
                <span key={m} className="absolute right-0 -translate-y-1/2" style={{ top: (i * ALTO) / 2 }}>
                  {formatoCompacto(m)}
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative" style={{ height: ALTO }}>
                {marcas.map((m, i) => (
                  <div key={m} className={`absolute inset-x-0 h-px ${i === 2 ? 'bg-slate-300' : 'bg-slate-100'}`} style={{ top: (i * ALTO) / 2 }} />
                ))}
                <div className="absolute inset-0 flex items-end justify-around">
                  {filas.map((f, i) => (
                    <div key={f.etiqueta} className="relative flex h-full min-w-0 max-w-14 flex-1 flex-col-reverse items-center gap-[2px] px-0.5">
                      {series.map(({ impuesto, clase }, s) => {
                        const valor = f.valores[impuesto]
                        if (valor <= 0) return null
                        const esUltimo = series.slice(s + 1).every((o) => f.valores[o.impuesto] <= 0)
                        const esActivo = activo?.fila === i && activo.impuesto === impuesto
                        return (
                          <div
                            key={impuesto}
                            tabIndex={0}
                            aria-label={`${f.etiqueta}, ${etiquetaImpuesto[impuesto]}: ${formatoPesos(valor)}`}
                            onPointerEnter={() => setActivo({ fila: i, impuesto })}
                            onPointerLeave={() => setActivo(null)}
                            onFocus={() => setActivo({ fila: i, impuesto })}
                            onBlur={() => setActivo(null)}
                            className={`w-full max-w-6 shrink-0 cursor-pointer outline-none transition-opacity ${clase} ${esUltimo ? 'rounded-t' : ''} ${
                              activo && !esActivo ? 'opacity-60' : ''
                            }`}
                            style={{ height: Math.max((valor / maximo) * ALTO - 2, 2) }}
                          />
                        )
                      })}
                      {activo?.fila === i && (
                        <div
                          className={`pointer-events-none absolute bottom-full z-10 mb-2 w-48 ${i < filas.length / 2 ? 'left-0' : 'right-0'} rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg`}
                        >
                          <p className="text-xs text-slate-500">{f.etiqueta}</p>
                          {series.map(({ impuesto, clase }) => (
                            <div key={impuesto} className="mt-1 flex items-center gap-2">
                              <span className={`h-0.5 w-3 ${clase}`} aria-hidden />
                              <span className={`text-sm ${activo.impuesto === impuesto ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                {formatoPesos(f.valores[impuesto])}
                              </span>
                              <span className="ml-auto text-xs text-slate-500">{etiquetaImpuesto[impuesto]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-around text-xs text-slate-500">
                {filas.map((f) => (
                  <span key={f.etiqueta} className="min-w-0 max-w-14 flex-1 text-center">{f.etiqueta}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
