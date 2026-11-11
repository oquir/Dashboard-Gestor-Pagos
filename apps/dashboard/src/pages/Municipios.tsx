import { useMemo } from 'react'
import { Navigate } from 'react-router'
import { ElegirMunicipio, PageHeader } from '../components/molecules'
import { BuscadorMunicipios, EncabezadoMunicipio, FormulariosMunicipio, ModulosMunicipio } from '../components/organisms'
import { puede } from '../lib/permisos'
import { impuestoActivo, useSesion } from '../lib/sesion'
import { useDatos } from '../store'
import type { CifrasMunicipio } from '../types'

export default function Municipios() {
  const { usuario, municipioId } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const inscripciones = useDatos((s) => s.inscripciones)
  const declaraciones = useDatos((s) => s.declaraciones)
  const pagos = useDatos((s) => s.pagos)
  const usuarios = useDatos((s) => s.usuarios)
  const configuraciones = useDatos((s) => s.configuraciones)
  // El que 1cero1 eligió en el buscador.
  const m = municipios.find((x) => x.id === municipioId)

  const cifras = useMemo<CifrasMunicipio | null>(() => {
    if (!municipioId) return null
    const suyas = declaraciones.filter(impuestoActivo(municipios)).filter((d) => d.municipioId === municipioId)
    const ids = new Set(suyas.map((d) => d.id))
    return {
      activas: inscripciones.filter((i) => i.municipioId === municipioId && i.estado === 'activa').length,
      declaraciones: suyas.length,
      recaudo: pagos.filter((p) => ids.has(p.declaracionId) && p.fecha.startsWith('2026')).reduce((s, p) => s + p.valor, 0),
      usuarios: usuarios.filter((u) => u.municipioId === municipioId && u.activo).length,
    }
  }, [municipioId, municipios, inscripciones, declaraciones, pagos, usuarios])

  if (!puede(usuario?.rol, 'gestionarMunicipios')) return <Navigate to="/" replace />

  const pausas = configuraciones.find((c) => c.municipioId === municipioId)?.formulariosDesactivados ?? {}

  return (
    <>
      <PageHeader
        titulo="Municipios"
        descripcion="Los municipios que usan el aplicativo. Busca uno por su nombre para ver sus cifras y activar lo que gestiona. Desactivar un municipio le quita el acceso a sus usuarios."
      />
      <BuscadorMunicipios todos={false} />
      <div className="space-y-6">
        {m && cifras ? (
          <>
            <EncabezadoMunicipio municipio={m} cifras={cifras} />
            <ModulosMunicipio municipio={m} pausas={pausas} />
            <FormulariosMunicipio municipio={m} pausas={pausas} />
          </>
        ) : (
          <ElegirMunicipio descripcion="Búscalo por su nombre para ver sus cifras y activar lo que gestiona." />
        )}
      </div>
    </>
  )
}
