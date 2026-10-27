import { Envelope, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { etiquetaEstadoAprobacion, formatoFecha, formatoPesos } from '../../../../lib/formato'
import { diasHabilesEntre, esperaAprobacion } from '../../../../lib/reglas'
import { tonoAprobacion } from '../../../../lib/tonos'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Badge, Boton, Card, Textarea } from '../../../atoms'
import { Aviso, Campo, CardHeader, Dato } from '../../../molecules'
import type { AprobacionPreviaProps } from './types'

/** Visto bueno del municipio antes del pago. Al resolverla, al contribuyente le llega un correo. */
export default function AprobacionPrevia({ d, situacion, correo, puedeResolver, pagoVentanilla }: AprobacionPreviaProps) {
  const resolverAprobacion = useDatos((s) => s.resolverAprobacion)
  const [observacion, setObservacion] = useState('')
  const pendiente = esperaAprobacion(situacion)
  const dias = diasHabilesEntre(hoy(), situacion.limite)
  const descuento = d.renglones.find((r) => r.codigo === '36')?.valor ?? 0

  return (
    <Card>
      <CardHeader
        titulo="Aprobación previa"
        descripcion="El contribuyente paga cuando el municipio aprueba la declaración."
        acciones={<Badge tono={tonoAprobacion[situacion.estado]}>{etiquetaEstadoAprobacion[situacion.estado]}</Badge>}
      />
      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <Dato etiqueta="Radicada">{formatoFecha(d.fechaPresentacion)}</Dato>
          <Dato etiqueta="Plazo para aprobar">
            {formatoFecha(situacion.limite)}
            {pendiente && (
              <span className={`block text-xs ${dias < 0 ? 'font-medium text-red-700' : 'text-slate-500'}`}>
                {dias > 1 ? `Quedan ${dias} días hábiles` : dias === 1 ? 'Queda 1 día hábil' : dias === 0 ? 'Vence hoy' : 'Vencido'}
              </span>
            )}
          </Dato>
        </dl>
        <p className="text-xs text-slate-500">
          Descuento, sanciones e intereses se liquidan con la fecha de radicación, aunque la aprobación llegue después
          {descuento > 0 ? `: conserva el descuento por pronto pago de ${formatoPesos(descuento)}.` : '.'}
        </p>

        {pendiente && puedeResolver && (
          <div className="space-y-3">
            <Campo etiqueta="Observación" ayuda="Obligatoria para rechazar. Le llega al contribuyente en el correo.">
              <Textarea rows={3} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </Campo>
            <div className="flex flex-wrap gap-2">
              <Boton variante="primario" onClick={() => resolverAprobacion(d.id, 'aprobada', observacion.trim())}>
                <TickCircle className="size-4" aria-hidden /> Aprobar
              </Boton>
              <Boton variante="peligro" disabled={!observacion.trim()} onClick={() => resolverAprobacion(d.id, 'rechazada', observacion.trim())}>
                Rechazar
              </Boton>
            </div>
          </div>
        )}
        {pendiente && !puedeResolver && <p className="text-sm text-slate-600">La aprobación la da la administración municipal.</p>}

        {situacion.reciboHasta && (
          <Aviso tono="exito" icono={Envelope}>
            <p className="font-medium">Se envió un correo a {correo}</p>
            <p className="mt-1">
              {situacion.estado === 'aprobada_automatica'
                ? `Se aprobó automáticamente al vencer el plazo, el ${formatoFecha(situacion.limite)}.`
                : `Aprobada por ${situacion.por} el ${formatoFecha(situacion.fecha!)}.`}{' '}
              {pagoVentanilla
                ? 'Puede pagar en línea, descargar la declaración con código de barras para pagar en el banco o pagar en efectivo en la ventanilla del municipio.'
                : 'Puede pagar en línea o descargar la declaración con código de barras para pagar en el banco.'}
              El recibo vale hasta el {formatoFecha(situacion.reciboHasta)}.
            </p>
            {situacion.observacion && <p className="mt-1">Observación: {situacion.observacion}</p>}
          </Aviso>
        )}
        {situacion.estado === 'rechazada' && (
          <Aviso tono="peligro" icono={Envelope}>
            <p className="font-medium">Se envió un correo a {correo}</p>
            <p className="mt-1">
              Rechazada por {situacion.por} el {formatoFecha(situacion.fecha!)}: {situacion.observacion}. El contribuyente debe corregirla y radicarla de nuevo.
            </p>
          </Aviso>
        )}
      </div>
    </Card>
  )
}
