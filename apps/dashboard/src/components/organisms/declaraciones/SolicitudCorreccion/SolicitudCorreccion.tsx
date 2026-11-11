import { Envelope, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { etiquetaEstadoCorreccion, formatoFecha, formatoPesos } from '../../../../lib/formato'
import { correccionPorResolver, menorValor, redondearMil, SANCION_RECHAZO_CORRECCION } from '../../../../lib/reglas'
import { tonoCorreccion } from '../../../../lib/tonos'
import { useDatos } from '../../../../store'
import { diferenciaDias, hoy } from '../../../../utils'
import { Badge, Boton, Card, Textarea } from '../../../atoms'
import { Aviso, Campo, CardHeader, Dato } from '../../../molecules'
import type { SolicitudCorreccionProps } from './types'

/**
 * Solicitud de corrección a la baja con el trámite del art. 589 anterior: el municipio la acepta o la rechaza dentro de
 * los 6 meses siguientes a la radicación; si no responde, se acepta sola. Al resolverla, al contribuyente le llega un correo.
 */
export default function SolicitudCorreccion({ d, corregida, situacion, correo, puedeResolver }: SolicitudCorreccionProps) {
  const resolverCorreccion = useDatos((s) => s.resolverCorreccion)
  const [observacion, setObservacion] = useState('')
  const porResolver = correccionPorResolver(situacion)
  const dias = diferenciaDias(hoy(), situacion.limite)
  const menor = corregida ? menorValor(d, corregida) : 0
  const sancion = redondearMil(menor * SANCION_RECHAZO_CORRECCION)
  const anterior = corregida ? `la declaración ${corregida.numero}` : 'la declaración que corrige'

  return (
    <Card>
      <CardHeader
        titulo="Solicitud de corrección a la baja"
        descripcion="El municipio tiene 6 meses para aceptarla o rechazarla; si no responde, se acepta sola (art. 589 del Estatuto Tributario, texto anterior a la Ley 1819 de 2016)."
        acciones={<Badge tono={tonoCorreccion[situacion.estado]}>{etiquetaEstadoCorreccion[situacion.estado]}</Badge>}
      />
      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <Dato etiqueta="Radicada">{formatoFecha(d.fechaPresentacion)}</Dato>
          <Dato etiqueta="Plazo para resolver">
            {formatoFecha(situacion.limite)}
            {porResolver && (
              <span className={`block text-xs ${dias <= 15 ? 'font-medium text-amber-700' : 'text-slate-500'}`}>
                {dias > 1 ? `Quedan ${dias} días` : dias === 1 ? 'Queda 1 día' : 'Vence hoy'}
              </span>
            )}
          </Dato>
        </dl>
        <dl className="space-y-4">
          <Dato etiqueta="Menor valor que pide">{formatoPesos(menor)}</Dato>
          <Dato etiqueta="Motivo del contribuyente">{situacion.motivo}</Dato>
        </dl>

        {porResolver && puedeResolver && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Si se acepta, reemplaza a {anterior}. Si se rechaza, esa sigue vigente y el rechazo lleva una sanción del 20 % del menor
              valor que pide ({formatoPesos(sancion)}), que impone la administración en el mismo acto, después de un proceso previo
              (Corte Constitucional, C-005 de 1998). El dashboard no la liquida.
            </p>
            <Campo etiqueta="Observación" ayuda="Obligatoria para rechazar. Le llega al contribuyente en el correo.">
              <Textarea rows={3} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </Campo>
            <div className="flex flex-wrap gap-2">
              <Boton variante="primario" onClick={() => resolverCorreccion(d.id, 'aceptada', observacion.trim())}>
                <TickCircle className="size-4" aria-hidden /> Aceptar
              </Boton>
              <Boton variante="peligro" disabled={!observacion.trim()} onClick={() => resolverCorreccion(d.id, 'rechazada', observacion.trim())}>
                Rechazar
              </Boton>
            </div>
          </div>
        )}
        {porResolver && !puedeResolver && <p className="text-sm text-slate-600">La resuelve la administración municipal.</p>}

        {situacion.estado === 'aceptada' && (
          <Aviso tono="exito" icono={Envelope}>
            <p className="font-medium">Se envió un correo a {correo}</p>
            <p className="mt-1">
              Aceptada por {situacion.por} el {formatoFecha(situacion.fecha!)}: reemplaza a {anterior}.
            </p>
            {situacion.observacion && <p className="mt-1">Observación: {situacion.observacion}</p>}
          </Aviso>
        )}
        {situacion.estado === 'aceptada_por_silencio' && (
          <Aviso tono="info">
            Se aceptó sola el {formatoFecha(situacion.limite)}: el municipio no la resolvió en los 6 meses (silencio positivo). Reemplaza
            a {anterior}.
          </Aviso>
        )}
        {situacion.estado === 'rechazada' && (
          <Aviso tono="peligro" icono={Envelope}>
            <p className="font-medium">Se envió un correo a {correo}</p>
            <p className="mt-1">
              Rechazada por {situacion.por} el {formatoFecha(situacion.fecha!)}: {situacion.observacion}. Sigue vigente {anterior}.
            </p>
            <p className="mt-1">
              El rechazo lleva una sanción del 20 % del menor valor que pidió ({formatoPesos(sancion)}), que impone la administración en
              el mismo acto. El dashboard no la liquida.
            </p>
          </Aviso>
        )}
      </div>
    </Card>
  )
}
