interface Opcion<T> {
  valor: T
  texto: string
  /** Cantidad junto al texto, como en las pestañas de un listado. */
  conteo?: number
}

/** Botones de opción única: las pestañas de una página o los controles de una gráfica. */
export default function Segmentado<T extends string | number>({ etiqueta, opciones, valor, cambiar, compacto = false, className = '' }: {
  etiqueta: string
  opciones: Opcion<T>[]
  valor: T
  cambiar: (valor: T) => void
  /** Botones más pequeños, para el encabezado de una tarjeta. */
  compacto?: boolean
  className?: string
}) {
  return (
    <div role="group" aria-label={etiqueta} className={`flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 ${className}`}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={valor === o.valor}
          onClick={() => cambiar(o.valor)}
          className={`rounded-md text-sm font-medium tabular-nums transition ${compacto ? 'px-2.5 py-1' : 'px-3 py-1.5'} ${
            valor === o.valor ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {o.texto}
          {o.conteo !== undefined && <span className="ml-1.5 text-xs text-slate-400">{o.conteo}</span>}
        </button>
      ))}
    </div>
  )
}
