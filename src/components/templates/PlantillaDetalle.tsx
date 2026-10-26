import { ArrowLeft } from 'reicon-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../molecules'

/** Página de detalle: enlace para volver al listado, encabezado y dos columnas (la ancha y la lateral). */
export default function PlantillaDetalle({ volver, titulo, descripcion, acciones, aviso, principal, lateral, idPrincipal }: {
  volver: { a: string; texto: string }
  titulo: string
  descripcion?: string
  acciones?: ReactNode
  /** A todo el ancho, entre el encabezado y las columnas. */
  aviso?: ReactNode
  principal: ReactNode
  lateral: ReactNode
  /** Para llevar la vista a la columna ancha, que en pantallas angostas queda arriba de la lateral. */
  idPrincipal?: string
}) {
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
