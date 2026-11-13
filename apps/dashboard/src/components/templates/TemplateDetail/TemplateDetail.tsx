import { ArrowLeft } from 'reicon-react'
import { Link } from 'react-router'
import { PageHeader } from '../../molecules'
import type { TemplateDetailProps } from './TemplateDetail.types'

/** Página de detalle: enlace para volver al listado, encabezado y dos columnas (la ancha y la lateral). */
export default function TemplateDetail({
  goBack,
  title,
  description,
  actions,
  notice,
  main,
  side,
  mainId,
}: TemplateDetailProps) {
  return (
    <>
      <Link
        to={goBack.a}
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg-strong"
      >
        <ArrowLeft className="size-4" aria-hidden /> {goBack.text}
      </Link>
      <PageHeader title={title} description={description} actions={actions} />
      {notice && <div className="mb-6">{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div id={mainId} className="scroll-mt-6 space-y-6 lg:col-span-2">
          {main}
        </div>
        <div className="space-y-6">{side}</div>
      </div>
    </>
  )
}
