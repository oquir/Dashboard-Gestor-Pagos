import { AlertTriangle, TickCircle } from 'reicon-react'
import type { Declaracion, Inscripcion } from '../../../types'
import { Card } from '../../atoms'
import { CardHeader } from '../../molecules'

/** Cruces automáticos que el funcionario ve antes de aprobar la declaración. */
function validaciones(d: Declaracion, ins: Inscripcion | undefined, contraRit: boolean) {
  const resultado: { ok: boolean; texto: string }[] = []
  const valor = (codigo: string) => d.renglones.find((r) => r.codigo === codigo)?.valor ?? 0
  const tiene = (calidad: string) => ins?.calidades.some((c) => c.calidad === calidad) ?? false

  // Cruces con el RIT: solo si el municipio tiene el RIT y la validación activa en este formulario.
  if (contraRit) {
    if (d.impuesto === 'reteica') {
      resultado.push({ ok: tiene('agente_retenedor'), texto: 'El declarante tiene la calidad de agente retenedor en el RIT' })
    }
    if (d.impuesto === 'autorretencion') {
      resultado.push({ ok: tiene('autorretenedor'), texto: 'El declarante está designado como autorretenedor en el RIT' })
    }
    if (d.impuesto === 'ica') {
      resultado.push({ ok: !ins?.regimenSimple, texto: 'El declarante no está en el SIMPLE según el RIT (allí el ICA se declara ante la DIAN)' })
      if (valor('28') > 0) resultado.push({ ok: tiene('autorretenedor'), texto: 'Las autorretenciones (renglón 28) corresponden a un autorretenedor del RIT' })
    }
  }
  if (d.tipo !== 'clausura') {
    const extemporanea = d.fechaPresentacion > d.fechaVencimiento
    const sancion = valor('31') + valor('S')
    resultado.push(
      extemporanea
        ? { ok: sancion > 0, texto: 'Presentada después del vencimiento: liquida sanción por extemporaneidad' }
        : { ok: true, texto: 'Presentada dentro del plazo' },
    )
  }
  if (d.tipo === 'correccion') resultado.push({ ok: Boolean(d.corrigeA), texto: 'Indica la declaración que corrige' })
  if (d.tipo === 'clausura') resultado.push({ ok: Boolean(d.fechaCierre), texto: 'Indica la fecha exacta de cierre' })
  return resultado
}

/** Lo que cumple y las inconsistencias de la declaración. */
export default function ValidacionesDeclaracion({ d, ins, contraRit, municipioConRit }: {
  d: Declaracion
  ins?: Inscripcion
  /** El municipio tiene el RIT y la validación activa en este formulario. */
  contraRit: boolean
  municipioConRit: boolean
}) {
  return (
    <Card>
      <CardHeader
        titulo="Validaciones"
        descripcion={
          contraRit
            ? undefined
            : municipioConRit
              ? 'Este formulario no se valida contra el RIT.'
              : 'El municipio no tiene el RIT en el aplicativo: no hay cruces contra el RIT.'
        }
      />
      <ul className="space-y-2 p-5">
        {validaciones(d, ins, contraRit).map((v) => (
          <li key={v.texto} className="flex items-start gap-2 text-sm">
            {v.ok ? (
              <TickCircle className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Cumple" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Inconsistencia" />
            )}
            <span className={v.ok ? 'text-slate-700' : 'font-medium text-red-700'}>{v.texto}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
