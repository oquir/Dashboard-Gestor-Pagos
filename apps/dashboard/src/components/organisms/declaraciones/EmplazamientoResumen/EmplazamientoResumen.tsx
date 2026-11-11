import { useState } from 'react'
import {
  sePuedeQuitar,
  situacionEmplazamiento,
  textoSituacion,
} from '../../../../lib/emplazamientos'
import {
  etiquetaEstadoEmplazamiento,
  etiquetaTipoEmplazamiento,
  formatoFecha,
} from '../../../../lib/formato'
import { puede } from '../../../../lib/permisos'
import { useSesion } from '../../../../lib/sesion'
import { tonoEmplazamiento } from '../../../../lib/tonos'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Badge, Boton } from '../../../atoms'
import { DocumentosEnviados, Modal } from '../../../molecules'
import type { EmplazamientoResumenProps } from './types'
import { textoPlazo } from './utils'

/**
 * Un emplazamiento: su estado, el número del acto, la notificación, el plazo o lo que sigue, y la copia. Mientras nadie
 * lo responda, el administrador y el funcionario lo pueden quitar si se registró por error.
 */
export default function EmplazamientoResumen({
  e,
  detalle = false,
  className = '',
}: EmplazamientoResumenProps) {
  const declaraciones = useDatos((s) => s.declaraciones)
  const quitarEmplazamiento = useDatos((s) => s.quitarEmplazamiento)
  const { usuario } = useSesion()
  const [confirmando, setConfirmando] = useState(false)
  const situacion = situacionEmplazamiento(e, declaraciones, hoy())
  const puedeQuitar = puede(usuario?.rol, 'revisar') && sePuedeQuitar(e, declaraciones)

  return (
    <div className={`text-xs ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tono={tonoEmplazamiento[situacion.estado]}>
          {etiquetaEstadoEmplazamiento[situacion.estado]}
        </Badge>
        {puedeQuitar && (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="text-slate-500 underline hover:text-red-700"
          >
            Quitar
          </button>
        )}
      </div>
      <p className="mt-1 whitespace-nowrap tabular-nums text-slate-700">
        N.º {e.numero} · notificado el {formatoFecha(e.fechaNotificacion)}
      </p>
      <p className="mt-0.5 text-slate-500">
        {detalle ? textoSituacion(e, situacion) : textoPlazo(e, situacion)}
      </p>
      {e.copia && (
        <DocumentosEnviados
          className="mt-1"
          documentos={[e.copia]}
          titulo={etiquetaTipoEmplazamiento[e.tipo]}
          contexto={[`N.º ${e.numero}`, `Notificado el ${formatoFecha(e.fechaNotificacion)}`]}
        />
      )}

      {confirmando && (
        <Modal
          titulo="Quitar el emplazamiento"
          descripcion={`Quita el registro del emplazamiento N.º ${e.numero}. Úsalo solo si se registró por error: queda en la bitácora.`}
          cerrar={() => setConfirmando(false)}
          pie={
            <>
              <Boton variante="secundario" onClick={() => setConfirmando(false)}>
                Cancelar
              </Boton>
              <Boton
                variante="peligro"
                onClick={() => {
                  quitarEmplazamiento(e.id)
                  setConfirmando(false)
                }}
              >
                Quitar
              </Boton>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            El aplicativo dejará de liquidarle la sanción más alta por este emplazamiento.
          </p>
        </Modal>
      )}
    </div>
  )
}
