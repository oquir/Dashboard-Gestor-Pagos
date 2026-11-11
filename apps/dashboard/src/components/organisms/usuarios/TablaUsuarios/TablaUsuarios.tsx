import { useMemo, useState } from 'react'
import { useSesion } from '../../../../lib'
import { useDatos } from '../../../../store'
import { Card } from '../../../atoms'
import Tabla from '../../Tabla'
import DetalleUsuario from '../DetalleUsuario'
import type { TablaUsuariosProps } from './TablaUsuarios.types'
import { columnasUsuarios, esGestionable, nombreMunicipio } from './TablaUsuarios.utils'

/** Usuarios con su rol y estado. El botón de cada fila abre su detalle, donde se desactiva, se elimina o se le reenvían las credenciales. */
export default function TablaUsuarios({ usuarios }: TablaUsuariosProps) {
  const { usuario } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const [verId, setVerId] = useState<string | null>(null)
  const columnas = useMemo(() => columnasUsuarios(municipios, setVerId), [municipios])
  // Se busca en cada render para que la ventana muestre el estado al día, y se cierre sola si el usuario se elimina.
  const viendo = usuarios.find((u) => u.id === verId)

  return (
    <Card>
      <Tabla
        datos={usuarios}
        columnas={columnas}
        idFila={(u) => u.id}
        nombre="usuarios"
        claseFila={(u) => (u.activo ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60')}
      />
      {viendo && (
        <DetalleUsuario
          key={viendo.id}
          usuario={viendo}
          municipio={nombreMunicipio(viendo, municipios)}
          gestionable={esGestionable(viendo, usuario)}
          cerrar={() => setVerId(null)}
        />
      )}
    </Card>
  )
}
