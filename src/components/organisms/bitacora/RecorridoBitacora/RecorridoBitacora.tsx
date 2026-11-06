import { ChevronLeft, ChevronRight } from 'reicon-react'
import { useNavigate } from 'react-router'
import { Boton } from '../../../atoms'
import type { RecorridoBitacoraProps } from './types'

/** Ir al registro anterior o al siguiente por número, dentro de lo que se recorre: un municipio o todos. */
export default function RecorridoBitacora({ anterior, siguiente, ambito }: RecorridoBitacoraProps) {
  const navegar = useNavigate()

  return (
    <nav aria-label="Registros vecinos" className="flex flex-wrap items-center justify-between gap-3">
      <Boton disabled={!anterior} onClick={() => anterior && navegar(`/bitacora/${anterior.id}`)}>
        <ChevronLeft className="size-4" aria-hidden /> {anterior ? `Anterior: N.º ${anterior.id}` : 'No hay anteriores'}
      </Boton>
      <p className="text-sm text-slate-500">Recorres los registros de {ambito}</p>
      <Boton disabled={!siguiente} onClick={() => siguiente && navegar(`/bitacora/${siguiente.id}`)}>
        {siguiente ? `Siguiente: N.º ${siguiente.id}` : 'No hay siguientes'} <ChevronRight className="size-4" aria-hidden />
      </Boton>
    </nav>
  )
}
