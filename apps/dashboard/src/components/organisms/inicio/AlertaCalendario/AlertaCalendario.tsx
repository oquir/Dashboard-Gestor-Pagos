import { Calendar } from 'reicon-react'
import { Link } from 'react-router'
import { formatoLista } from '../../../../lib/formato'
import { puede } from '../../../../lib/permisos'
import { useSesion } from '../../../../lib/sesion'
import { Aviso } from '../../../molecules'
import type { AlertaCalendarioProps } from './AlertaCalendario.types'

/**
 * Aviso de Inicio desde el 1 de enero, mientras el municipio no cargue el calendario del año. Al administrador y a
 * 1cero1 los lleva a Calendario; al funcionario le dice que lo carga el administrador. Con el calendario cargado, no sale.
 */
export default function AlertaCalendario({
  anio,
  municipios,
  className = '',
}: AlertaCalendarioProps) {
  const { usuario } = useSesion()
  if (municipios.length === 0) return null
  const editable = puede(usuario?.rol, 'editarConfiguracion')
  const varios = municipios.length > 1
  const unico = municipios[0]
  const enlace = editable && (
    <Link to="/calendario" className="font-medium underline">
      Ir a Calendario
    </Link>
  )

  return (
    <div className={className}>
      <Aviso tono="alerta" icono={Calendar} rol="alert">
        <p className="font-medium">
          {varios
            ? `${municipios.length} municipios no han cargado el calendario tributario de ${anio}: ${formatoLista(municipios.map((m) => m.nombre))}.`
            : usuario?.rol === '1cero1'
              ? `${unico.nombre} no ha cargado el calendario tributario de ${anio}.`
              : editable
                ? `Falta cargar el calendario tributario de ${anio}.`
                : `El administrador del municipio aún no ha cargado el calendario tributario de ${anio}.`}
        </p>
        <p className="mt-0.5">
          {editable && !varios && (
            <>
              Agrega el año gravable {anio} con las fechas del acto del municipio
              {unico.impuestos.ica &&
                `, y revisa la fecha del ICA del año gravable ${anio - 1}, que vence en ${anio}`}
              .{' '}
            </>
          )}
          Mientras tanto, las declaraciones que entren quedan marcadas como presentadas sin
          calendario: revisa su vencimiento, su sanción y sus intereses. {enlace}
        </p>
      </Aviso>
    </div>
  )
}
