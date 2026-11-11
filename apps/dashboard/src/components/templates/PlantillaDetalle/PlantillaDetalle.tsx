import { ArrowLeft } from 'reicon-react'
import { Link } from 'react-router'
import { PageHeader } from '../../molecules'
import type { PlantillaDetalleProps } from './types'

/** Página de detalle: enlace para volver al listado, encabezado y dos columnas (la ancha y la lateral). */
export default function PlantillaDetalle({ volver, titulo, descripcion, acciones, aviso, principal, lateral, idPrincipal }: PlantillaDetalleProps) {
  return (
    <>
      <Link to={volver.a} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden /> {volver.texto}
      </Link>
      <PageHeader titulo={titulo} descripcion={descripcion} acciones={acciones} />
      {aviso && <div className="mb-6">{aviso}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div id={idPrincipal} className="scroll-mt-6 space-y-6 lg:col-span-2">
          {principal}
        </div>
        <div className="space-y-6">{lateral}</div>
      </div>
    </>
  )
}
