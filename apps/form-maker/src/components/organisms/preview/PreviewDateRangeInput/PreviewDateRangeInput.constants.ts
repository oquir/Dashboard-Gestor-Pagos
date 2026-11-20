// Lado a lado mientras quepan: un input date no baja de ~9rem (13rem con hora). Dos literales
// porque Tailwind lee el codigo fuente.
export const RANGE_GRID_CLASSES: string = 'grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2'

export const RANGE_GRID_WITH_TIME_CLASSES: string =
  'grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-2'

export const END_CLASSES: string = 'flex min-w-0 flex-col gap-1'

export const END_CAPTION_CLASSES: string = 'text-[11px] text-fg-muted'
