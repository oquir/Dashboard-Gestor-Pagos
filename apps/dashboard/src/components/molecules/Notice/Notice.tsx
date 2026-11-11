import { TONE_CLASSES } from './Notice.constants'
import type { NoticeProps } from './Notice.types'

/** Recuadro de color para resultados, errores y avisos. El color siempre va con su texto. */
export default function Notice({ tone, icon: IconComponent, role, children }: NoticeProps) {
  return (
    <div role={role} className={`flex gap-2 rounded-lg px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}>
      {IconComponent && <IconComponent className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
