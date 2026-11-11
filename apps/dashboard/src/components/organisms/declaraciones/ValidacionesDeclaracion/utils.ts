import { formatoFecha, formatoPesos } from '../../../../lib/formato'
import {
  esCorreccionABaja,
  impuestoACargo,
  limiteCorreccionABaja,
  sancionExtemporaneidad,
  sancionLiquidada,
} from '../../../../lib/reglas'
import type { Declaracion, Inscripcion } from '../../../../types'
import { diferenciaDias } from '../../../../utils'
import type { ContextoSancion, Validacion } from './types'

/** Cruces automáticos que el funcionario ve antes de aprobar la declaración. */
export function validaciones(
  d: Declaracion,
  ins: Inscripcion | undefined,
  contraRit: boolean,
  corregida?: Declaracion,
  { emplazamiento, sanciones }: ContextoSancion = {},
) {
  const resultado: Validacion[] = []
  const valor = (codigo: string) => d.renglones.find((r) => r.codigo === codigo)?.valor ?? 0
  const tiene = (calidad: string) => ins?.calidades.some((c) => c.calidad === calidad) ?? false

  // Cruces con el RIT: solo si el municipio tiene el RIT y la validación activa en este formulario.
  if (contraRit) {
    if (d.impuesto === 'reteica') {
      resultado.push({
        ok: tiene('agente_retenedor'),
        texto: 'El contribuyente tiene la calidad de agente retenedor en el RIT',
      })
    }
    if (d.impuesto === 'autorretencion') {
      resultado.push({
        ok: tiene('autorretenedor'),
        texto: 'El contribuyente está designado como autorretenedor en el RIT',
      })
    }
    if (d.impuesto === 'ica') {
      resultado.push({
        ok: !ins?.regimenSimple,
        texto:
          'El contribuyente no está en el SIMPLE según el RIT (allí el ICA se declara ante la DIAN)',
      })
      if (valor('28') > 0)
        resultado.push({
          ok: tiene('autorretenedor'),
          texto: 'Las autorretenciones (renglón 28) corresponden a un autorretenedor del RIT',
        })
    }
  }
  // La extemporaneidad es de la inicial: una corrección no es extemporánea por presentarse después del vencimiento
  // (art. 644, parágrafo 1, del Estatuto Tributario).
  if (d.tipo === 'inicial') {
    const extemporanea = d.fechaPresentacion > d.fechaVencimiento
    const sancion = sancionLiquidada(d)
    // Después del emplazamiento para declarar, la extemporaneidad es la del art. 642: se revisa que llegue a lo que da.
    if (extemporanea && emplazamiento?.tipo === 'declarar' && sanciones) {
      const esperada = sancionExtemporaneidad(
        impuestoACargo(d),
        diferenciaDias(d.fechaVencimiento, d.fechaPresentacion),
        sanciones,
        true,
      )
      resultado.push({
        ok: sancion >= esperada,
        texto: `Presentada después del emplazamiento para declarar N.º ${emplazamiento.numero}, notificado el ${formatoFecha(emplazamiento.fechaNotificacion)}: liquida la extemporaneidad del art. 642, al ${sanciones.extemporaneidadEmplazamiento} % por mes, de al menos ${formatoPesos(esperada)}`,
      })
    } else {
      resultado.push(
        extemporanea
          ? {
              ok: sancion > 0,
              texto: 'Presentada después del vencimiento: liquida sanción por extemporaneidad',
            }
          : { ok: true, texto: 'Presentada dentro del plazo' },
      )
    }
  }
  if (d.tipo === 'correccion')
    resultado.push({ ok: Boolean(d.corrigeA), texto: 'Indica la declaración que corrige' })
  // Después del emplazamiento para corregir, la sanción por corrección es la del art. 644, numeral 2. El dashboard no
  // rehace el mayor valor: revisa que la corrección agregue sanción. Corregir a la baja no la lleva (parágrafo 4).
  if (
    d.tipo === 'correccion' &&
    emplazamiento?.tipo === 'corregir' &&
    sanciones &&
    !esCorreccionABaja(d, corregida)
  ) {
    resultado.push({
      ok: sancionLiquidada(d) > (corregida ? sancionLiquidada(corregida) : 0),
      texto: `Corrige después del emplazamiento para corregir N.º ${emplazamiento.numero}, notificado el ${formatoFecha(emplazamiento.fechaNotificacion)}: liquida la sanción por corrección del art. 644, numeral 2, del ${sanciones.correccionEmplazamiento} % del mayor valor`,
    })
  }
  // La corrección a la baja, directa o con solicitud, se presenta dentro del año siguiente al vencimiento (art. 589).
  if (esCorreccionABaja(d, corregida)) {
    resultado.push({
      ok: d.fechaPresentacion <= limiteCorreccionABaja(d.fechaVencimiento),
      texto: `Se presentó dentro del año siguiente al vencimiento, hasta el ${formatoFecha(limiteCorreccionABaja(d.fechaVencimiento))} (art. 589)`,
    })
  }
  if (d.tipo === 'clausura')
    resultado.push({ ok: Boolean(d.fechaCierre), texto: 'Indica la fecha exacta de cierre' })
  return resultado
}
