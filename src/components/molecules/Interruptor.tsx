import { Casilla } from '../atoms'

/** Casilla con su etiqueta y una ayuda opcional, para encender o apagar una opción. */
export default function Interruptor({ etiqueta, ayuda, valor, onChange, deshabilitado = false }: {
  etiqueta: string
  ayuda?: string
  valor: boolean
  onChange: (valor: boolean) => void
  deshabilitado?: boolean
}) {
  return (
    <label className="flex items-start gap-3">
      <Casilla className="mt-0.5" checked={valor} disabled={deshabilitado} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm font-medium text-slate-700">{etiqueta}</span>
        {ayuda && <span className="block text-xs text-slate-500">{ayuda}</span>}
      </span>
    </label>
  )
}
