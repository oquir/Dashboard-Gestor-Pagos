import { Plus } from 'reicon-react'
import { useState } from 'react'
import { Navigate } from 'react-router'
import { Boton } from '../components/atoms'
import { PageHeader } from '../components/molecules'
import { BuscadorMunicipios, NuevoUsuario, TablaUsuarios } from '../components/organisms'
import { puede } from '../lib/permisos'
import { delMunicipio, useSesion } from '../lib/sesion'
import { useDatos } from '../store'

export default function Usuarios() {
  const { usuario, municipioId } = useSesion()
  const usuarios = useDatos((s) => s.usuarios)
  const [creando, setCreando] = useState(false)

  if (!puede(usuario?.rol, 'gestionarUsuarios')) return <Navigate to="/" replace />

  const lista = municipioId === null ? usuarios : delMunicipio(usuarios, municipioId)

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion={usuario?.rol === '1cero1' ? 'Usuarios de todos los municipios y del equipo de 1cero1.' : 'Funcionarios y administradores de tu municipio.'}
        acciones={
          !creando && (
            <Boton variante="primario" onClick={() => setCreando(true)}>
              <Plus className="size-4" aria-hidden /> Nuevo usuario
            </Boton>
          )
        }
      />
      <BuscadorMunicipios />
      {creando && <NuevoUsuario alTerminar={() => setCreando(false)} />}
      <TablaUsuarios usuarios={lista} />
    </>
  )
}
