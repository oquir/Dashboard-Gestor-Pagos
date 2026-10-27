import { useMemo } from 'react'
import { Navigate } from 'react-router'
import { PageHeader } from '../components/molecules'
import { TarjetaMunicipio } from '../components/organisms'
import { puede } from '../lib/permisos'
import { impuestoActivo, useSesion } from '../lib/sesion'
import { useDatos } from '../store'

export default function Municipios() {
  const { usuario } = useSesion()
  const municipios = useDatos((s) => s.municipios)
  const inscripciones = useDatos((s) => s.inscripciones)
  const declaraciones = useDatos((s) => s.declaraciones)
  const pagos = useDatos((s) => s.pagos)
  const usuarios = useDatos((s) => s.usuarios)

  const resumen = useMemo(() => {
    const visibles = declaraciones.filter(impuestoActivo(municipios))
    const municipioDe = new Map(visibles.map((d) => [d.id, d.municipioId]))
    return new Map(
      municipios.map((m) => [
        m.id,
        {
          activas: inscripciones.filter((i) => i.municipioId === m.id && i.estado === 'activa').length,
          declaraciones: visibles.filter((d) => d.municipioId === m.id).length,
          recaudo: pagos.filter((p) => municipioDe.get(p.declaracionId) === m.id && p.fecha.startsWith('2026')).reduce((s, p) => s + p.valor, 0),
          usuarios: usuarios.filter((u) => u.municipioId === m.id && u.activo).length,
        },
      ]),
    )
  }, [municipios, inscripciones, declaraciones, pagos, usuarios])

  if (!puede(usuario?.rol, 'gestionarMunicipios')) return <Navigate to="/" replace />

  return (
    <>
      <PageHeader titulo="Municipios" descripcion="Municipios que usan el aplicativo: si tienen el RIT, si cargan el Asobancaria 2001, si reciben pagos en ventanilla, qué formularios gestionan, si cada formulario se valida contra el RIT y si el municipio aprueba las declaraciones antes del pago. Desactivar un municipio le quita el acceso a sus usuarios en la demo." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {municipios.map((m) => (
          <TarjetaMunicipio key={m.id} municipio={m} resumen={resumen.get(m.id)!} />
        ))}
      </div>
    </>
  )
}
