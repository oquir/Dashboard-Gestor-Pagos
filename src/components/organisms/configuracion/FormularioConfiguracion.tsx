import { Save } from 'reicon-react'
import { useState } from 'react'
import { erroresConfiguracion } from '../../../lib/configuracion'
import { IMPUESTOS } from '../../../lib/sesion'
import { useDatos } from '../../../store'
import type { ConfigMunicipio } from '../../../types'
import { Boton } from '../../atoms'
import SeccionAprobacionPrevia from './SeccionAprobacionPrevia'
import SeccionFuncionarios from './SeccionFuncionarios'
import SeccionIca from './SeccionIca'
import SeccionProcedimiento from './SeccionProcedimiento'
import SeccionRetencion from './SeccionRetencion'
import SeccionSanciones from './SeccionSanciones'

const TODOS_ACTIVOS = { ica: true, reteica: true, autorretencion: true }

/** Configuración del municipio como borrador: se valida mientras se edita y al final se guarda o se descarta. */
export default function FormularioConfiguracion({ config, editable }: { config: ConfigMunicipio; editable: boolean }) {
  const guardarConfiguracion = useDatos((s) => s.guardarConfiguracion)
  // Solo se configura lo que el municipio tiene activo: impuestos y RIT (los define 1cero1).
  const municipio = useDatos((s) => s.municipios.find((m) => m.id === config.municipioId))
  const impuestos = municipio?.impuestos ?? TODOS_ACTIVOS
  const conRit = municipio?.rit ?? true
  const conAprobacion = IMPUESTOS.filter((i) => impuestos[i] && municipio?.aprobacionPrevia[i])
  const [b, setB] = useState(config)
  const [guardado, setGuardado] = useState(false)
  const cambiar = (parcial: Partial<ConfigMunicipio>) => {
    setB((actual) => ({ ...actual, ...parcial }))
    setGuardado(false)
  }

  const errores = erroresConfiguracion(b)
  const hayErrores = Object.keys(errores).length > 0
  const cambio = JSON.stringify(b) !== JSON.stringify(config)
  const edicion = { b, cambiar, editable, errores }

  return (
    <div className="space-y-6">
      {(impuestos.reteica || impuestos.autorretencion) && <SeccionRetencion {...edicion} impuestos={impuestos} />}
      {impuestos.ica && <SeccionIca {...edicion} />}
      <SeccionProcedimiento {...edicion} conRit={conRit} />
      {conAprobacion.length > 0 && <SeccionAprobacionPrevia {...edicion} impuestos={conAprobacion} />}
      <SeccionFuncionarios {...edicion} />
      <SeccionSanciones {...edicion} />

      {editable && (
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {hayErrores && <span className="mr-auto text-sm text-red-700">Corrige los campos marcados antes de guardar.</span>}
          {guardado && <span className="mr-auto text-sm text-emerald-700">Configuración guardada.</span>}
          <Boton variante="secundario" disabled={!cambio} onClick={() => { setB(config); setGuardado(false) }}>
            Descartar cambios
          </Boton>
          <Boton variante="primario" disabled={!cambio || hayErrores} onClick={() => { guardarConfiguracion(b); setGuardado(true) }}>
            <Save className="size-4" aria-hidden /> Guardar
          </Boton>
        </div>
      )}
    </div>
  )
}
