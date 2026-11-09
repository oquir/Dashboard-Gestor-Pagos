/** Logo y nombre del aplicativo en el menú lateral. */
export default function Marca() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <img src="/1cero1.svg" alt="1cero1" className="h-9 w-auto" />
      <div>
        <p className="text-sm font-semibold text-slate-900">Gestor de Pagos</p>
      </div>
    </div>
  )
}
