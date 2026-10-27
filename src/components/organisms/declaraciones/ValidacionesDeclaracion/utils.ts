import type { Declaracion, Inscripcion } from '../../../../types'
import type { Validacion } from './types'

/** Cruces automáticos que el funcionario ve antes de aprobar la declaración. */
export function validaciones(d: Declaracion, ins: Inscripcion | undefined, contraRit: boolean) {
  const resultado: Validacion[] = []
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
