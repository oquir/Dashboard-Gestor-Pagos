import { Add } from 'reicon-react'
import { useState } from 'react'
import { Link } from 'react-router'
import {
  emplazamientoPrevio,
  emplazamientosParaCorregir,
  situacionEmplazamiento,
} from '../../../../lib/emplazamientos'
import {
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoEmplazamiento,
} from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Boton, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import EmplazamientoResumen from '../EmplazamientoResumen'
import ModalEmplazamiento from '../ModalEmplazamiento'
import type { EmplazamientosDeclaracionProps } from './types'

/**
 * Los emplazamientos de la declaración: al que responde (el de declarar de su periodo o el de corregir de la que corrige)
 * y los de corregir notificados sobre ella. En una declaración vigente, el administrador y el funcionario registran
 * el emplazamiento para corregir que el municipio notificó.
 */
export default function EmplazamientosDeclaracion({
  d,
  puedeRegistrar,
}: EmplazamientosDeclaracionProps) {
  const declaraciones = useDatos((s) => s.declaraciones)
  const emplazamientos = useDatos((s) => s.emplazamientos)
  const [registrando, setRegistrando] = useState(false)
  const previo = emplazamientoPrevio(d, declaraciones, emplazamientos)
  const emplazada =
    previo?.tipo === 'corregir'
      ? declaraciones.find((x) => x.id === previo.declaracionId)
      : undefined
  const propios = emplazamientosParaCorregir(d, emplazamientos)
  if (!previo && propios.length === 0 && !puedeRegistrar) return null

  return (
    <Card>
      <CardHeader
        titulo="Emplazamientos"
        descripcion="Los que el municipio notificó y registró aquí. Desde la notificación, la sanción es más alta."
        acciones={
          puedeRegistrar && (
            <Boton variante="secundario" onClick={() => setRegistrando(true)}>
              <Add className="size-4" aria-hidden /> Para corregir
            </Boton>
          )
        }
      />
      <div className="space-y-4 p-5">
        {previo && (
          <div>
            <p className="text-sm font-medium text-slate-900">
              {d.tipo === 'correccion' ? 'Corrige' : 'Se presentó'} después del{' '}
              {etiquetaTipoEmplazamiento[previo.tipo].toLowerCase()}
            </p>
            {emplazada && (
              <p className="text-xs text-slate-500">
                Notificado sobre la{' '}
                <Link
                  className="font-medium text-brand-700 underline"
                  to={`/declaraciones/${emplazada.id}`}
                >
                  {emplazada.numero}
                </Link>
                .
              </p>
            )}
            <EmplazamientoResumen e={previo} detalle className="mt-2" />
          </div>
        )}
        {propios.map((e) => {
          const respuesta = situacionEmplazamiento(e, declaraciones, hoy()).respuesta
          return (
            <div key={e.id}>
              <p className="text-sm font-medium text-slate-900">
                {etiquetaTipoEmplazamiento[e.tipo]}
              </p>
              {respuesta && (
                <p className="text-xs text-slate-500">
                  Lo respondió la corrección{' '}
                  <Link
                    className="font-medium text-brand-700 underline"
                    to={`/declaraciones/${respuesta.id}`}
                  >
                    {respuesta.numero}
                  </Link>
                  .
                </p>
              )}
              <EmplazamientoResumen e={e} detalle className="mt-2" />
            </div>
          )
        })}
        {!previo && propios.length === 0 && (
          <p className="text-sm text-slate-500">
            No tiene emplazamientos. Si el municipio le notificó uno para corregir, regístralo para
            que el aplicativo le liquide la sanción del art. 644, numeral 2.
          </p>
        )}
      </div>

      {registrando && (
        <ModalEmplazamiento
          tipo="corregir"
          destinatarios={[
            {
              clave: d.id,
              titulo: d.contribuyente.nombre,
              descripcion: `${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d)} · radicado ${d.numero}`,
              desde: d.fechaPresentacion,
              destino: { tipo: 'corregir', municipioId: d.municipioId, declaracionId: d.id },
            },
          ]}
          cerrar={() => setRegistrando(false)}
        />
      )}
    </Card>
  )
}
