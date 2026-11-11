import { Envelope, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { guardarArchivo } from '../../../../lib'
import { etiquetaEstadoAprobacion, formatoFecha, formatoPesos } from '../../../../lib'
import { diasHabilesEntre, esperaAprobacion } from '../../../../lib'
import { tonoAprobacion } from '../../../../lib'
import { useDatos } from '../../../../store'
import type { CausalNoPresentada, ResolucionAprobacion } from '../../../../types'
import { hoy } from '../../../../utils'
import { Badge, Boton, Card, Select, Textarea } from '../../../atoms'
import {
  AdjuntarDocumentos,
  Aviso,
  Campo,
  CardHeader,
  Dato,
  DocumentosEnviados,
} from '../../../molecules'
import { CAUSALES } from './AprobacionPrevia.constants'
import type { AprobacionPreviaProps } from './AprobacionPrevia.types'
import { textoMedios, textoQueHacer } from './AprobacionPrevia.utils'

/**
 * Visto bueno del municipio antes del pago. Solo se rechaza por una causal del art. 580 del Estatuto Tributario, con un
 * comentario y documentos opcionales. Al resolverla, al contribuyente le llega un correo.
 */
export default function AprobacionPrevia({
  d,
  situacion,
  correo,
  puedeResolver,
  ventanilla,
}: AprobacionPreviaProps) {
  const resolverAprobacion = useDatos((s) => s.resolverAprobacion)
  const [causal, setCausal] = useState<CausalNoPresentada | ''>('')
  const [faltaCausal, setFaltaCausal] = useState(false)
  const [comentario, setComentario] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [enviando, setEnviando] = useState(false)
  const pendiente = esperaAprobacion(situacion)
  const dias = diasHabilesEntre(hoy(), situacion.limite)
  const descuento = d.renglones.find((r) => r.codigo === '36')?.valor ?? 0

  const resolver = async (resolucion: ResolucionAprobacion) => {
    setEnviando(true)
    const documentos = await Promise.all(archivos.map(guardarArchivo))
    resolverAprobacion(d.id, resolucion, comentario.trim(), documentos)
  }
  const rechazar = () => (causal ? resolver({ estado: 'rechazada', causal }) : setFaltaCausal(true))

  const enviados = situacion.documentos && (
    <DocumentosEnviados
      className="mt-1.5"
      documentos={situacion.documentos}
      titulo="Respuesta a la aprobación previa"
      contexto={[`Declaración: ${d.numero}`, `Contribuyente: ${d.contribuyente.nombre}`]}
    />
  )
  const causalRechazo = situacion.estado === 'rechazada' ? situacion.causal : undefined

  return (
    <Card>
      <CardHeader
        titulo="Aprobación previa"
        descripcion="El contribuyente paga cuando el municipio aprueba la declaración."
        acciones={
          <Badge tono={tonoAprobacion[situacion.estado]}>
            {etiquetaEstadoAprobacion[situacion.estado]}
          </Badge>
        }
      />
      <div className="space-y-4 p-5">
        <dl className="grid grid-cols-2 gap-4">
          <Dato etiqueta="Radicada">{formatoFecha(d.fechaPresentacion)}</Dato>
          <Dato etiqueta="Plazo para aprobar">
            {formatoFecha(situacion.limite)}
            {pendiente && (
              <span
                className={`block text-xs ${dias < 0 ? 'font-medium text-red-700' : 'text-slate-500'}`}
              >
                {dias > 1
                  ? `Quedan ${dias} días hábiles`
                  : dias === 1
                    ? 'Queda 1 día hábil'
                    : dias === 0
                      ? 'Vence hoy'
                      : 'Vencido'}
              </span>
            )}
          </Dato>
        </dl>
        <p className="text-xs text-slate-500">
          Descuento, sanciones e intereses se liquidan con la fecha de radicación, aunque la
          aprobación llegue después
          {descuento > 0
            ? `: conserva el descuento por pronto pago de ${formatoPesos(descuento)}.`
            : '.'}
        </p>

        {pendiente && puedeResolver && (
          <div className="space-y-3">
            <Campo
              etiqueta="Causal del rechazo"
              ayuda={
                causal
                  ? `${CAUSALES[causal].descripcion} ${textoQueHacer(causal)}`
                  : 'Obligatoria para rechazar: solo por estas causales la declaración se tiene por no presentada (art. 580 del Estatuto Tributario).'
              }
              error={faltaCausal ? 'Escoge la causal del rechazo.' : undefined}
            >
              <Select
                value={causal}
                onChange={(e) => {
                  setCausal(e.target.value as CausalNoPresentada | '')
                  setFaltaCausal(false)
                }}
              >
                <option value="">Ninguna</option>
                {(Object.keys(CAUSALES) as CausalNoPresentada[]).map((valor) => (
                  <option key={valor} value={valor}>
                    {CAUSALES[valor].literal}) {CAUSALES[valor].etiqueta}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo
              etiqueta="Comentario"
              ayuda="Opcional. Le llega al contribuyente en el correo, con los documentos."
            >
              <Textarea
                rows={3}
                placeholder="Ej.: falta la firma del revisor fiscal; la sociedad está obligada a tenerlo."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </Campo>
            <AdjuntarDocumentos archivos={archivos} onChange={setArchivos} />
            <div className="flex flex-wrap gap-2">
              <Boton
                variante="primario"
                disabled={enviando}
                onClick={() => resolver({ estado: 'aprobada' })}
              >
                <TickCircle className="size-4" aria-hidden /> Aprobar
              </Boton>
              <Boton variante="peligro" disabled={enviando} onClick={rechazar}>
                Rechazar
              </Boton>
            </div>
          </div>
        )}
        {pendiente && !puedeResolver && (
          <p className="text-sm text-slate-600">La aprobación la da la administración municipal.</p>
        )}

        {situacion.reciboHasta && (
          <Aviso tono="exito" icono={Envelope}>
            <p className="font-medium">Se envió un correo a {correo}</p>
            <p className="mt-1">
              {situacion.estado === 'aprobada_automatica'
                ? `Se aprobó automáticamente al vencer el plazo, el ${formatoFecha(situacion.limite)}.`
                : `Aprobada por ${situacion.por} el ${formatoFecha(situacion.fecha!)}.`}{' '}
              {textoMedios(ventanilla)}
              El recibo vale hasta el {formatoFecha(situacion.reciboHasta)}.
            </p>
            {situacion.observacion && <p className="mt-1">Comentario: {situacion.observacion}</p>}
            {enviados}
          </Aviso>
        )}
        {causalRechazo && (
          <Aviso tono="peligro" icono={Envelope}>
            <p className="font-medium">Se envió un correo a {correo}</p>
            <p className="mt-1">
              Rechazada por {situacion.por} el {formatoFecha(situacion.fecha!)}. Causal: literal{' '}
              {CAUSALES[causalRechazo].literal}) del art. 580,{' '}
              {CAUSALES[causalRechazo].etiqueta.toLowerCase()}.{' '}
              {CAUSALES[causalRechazo].descripcion} La declaración se tiene por no presentada.{' '}
              {textoQueHacer(causalRechazo)}
            </p>
            {situacion.observacion && <p className="mt-1">Comentario: {situacion.observacion}</p>}
            {enviados}
          </Aviso>
        )}
      </div>
    </Card>
  )
}
