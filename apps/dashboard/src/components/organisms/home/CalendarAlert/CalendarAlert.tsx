import { Calendar } from 'reicon-react'
import { Link } from 'react-router'
import { formatList, can, useSession } from '../../../../lib'
import { Notice } from '../../../molecules'
import type { CalendarAlertProps } from './CalendarAlert.types'

/**
 * Aviso de Inicio desde el 1 de enero, mientras el municipio no cargue el calendario del año. Al administrador y a
 * 1cero1 los lleva a Calendario; al funcionario le dice que lo carga el administrador. Con el calendario cargado, no sale.
 */
export default function CalendarAlert({
  year,
  municipalities,
  className = '',
}: CalendarAlertProps) {
  const { user } = useSession()
  if (municipalities.length === 0) return null
  const editable = can(user?.role, 'editSettings')
  const several = municipalities.length > 1
  const unique = municipalities[0]
  const link = editable && (
    <Link to="/calendario" className="font-medium underline">
      Ir a Calendario
    </Link>
  )

  return (
    <div className={className}>
      <Notice tone="alert" icon={Calendar} role="alert">
        <p className="font-medium">
          {several
            ? `${municipalities.length} municipios no han cargado el calendario tributario de ${year}: ${formatList(municipalities.map((m) => m.name))}.`
            : user?.role === '1cero1'
              ? `${unique.name} no ha cargado el calendario tributario de ${year}.`
              : editable
                ? `Falta cargar el calendario tributario de ${year}.`
                : `El administrador del municipio aún no ha cargado el calendario tributario de ${year}.`}
        </p>
        <p className="mt-0.5">
          {editable && !several && (
            <>
              Agrega el año gravable {year} con las fechas del acto del municipio
              {unique.taxes.ica &&
                `, y revisa la fecha del ICA del año gravable ${year - 1}, que vence en ${year}`}
              .{' '}
            </>
          )}
          Mientras tanto, las declaraciones que entren quedan marcadas como presentadas sin
          calendario: revisa su vencimiento, su sanción y sus intereses. {link}
        </p>
      </Notice>
    </div>
  )
}
