import { useMemo } from 'react'
import { useSesion } from '../../../../lib/sesion'
import { useDatos } from '../../../../store'
import { Card } from '../../../atoms'
import Tabla from '../../Tabla'
import type { TablaUsuariosProps } from './types'
import { columnasUsuarios } from './utils'

/** Usuarios con su rol y estado. Nadie se desactiva a sí mismo, y solo 1cero1 desactiva a los de 1cero1. */
export default function TablaUsuarios({ usuarios }: TablaUsuariosProps) {
  const { usuario } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const alternarUsuario = useDatos((s) => s.alternarUsuario)
  const columnas = useMemo(() => columnasUsuarios(municipios, usuario, alternarUsuario), [municipios, usuario, alternarUsuario])

  return (
    <Card>
      <Tabla
        datos={usuarios}
        columnas={columnas}
        idFila={(u) => u.id}
        nombre="usuarios"
        claseFila={(u) => (u.activo ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60')}
      />
    </Card>
  )
}
