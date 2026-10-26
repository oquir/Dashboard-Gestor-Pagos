import { Zip } from 'reicon-react'
import { useState } from 'react'
import { descargarDeclaracionesZip } from '../../../lib/pdfDeclaracion'
import { useDatos } from '../../../store'
import type { Declaracion } from '../../../types'
import { Boton } from '../../atoms'

/** Aparece al marcar declaraciones: las descarga en PDF dentro de un .zip o quita la selección. */
export default function SeleccionDeclaraciones({ declaraciones, quitar }: { declaraciones: Declaracion[]; quitar: () => void }) {
  const [generando, setGenerando] = useState(false)

  if (declaraciones.length === 0) return null

  const descargar = async () => {
    setGenerando(true)
    try {
      await descargarDeclaracionesZip(declaraciones, useDatos.getState(), `declaraciones_${new Date().toISOString().slice(0, 10)}.zip`)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-sm">
      <span className="font-medium text-brand-800">
        {declaraciones.length} {declaraciones.length === 1 ? 'declaración seleccionada' : 'declaraciones seleccionadas'}
      </span>
      <Boton variante="primario" disabled={generando} onClick={descargar}>
        <Zip className="size-4" aria-hidden /> {generando ? 'Generando PDF…' : 'Descargar PDF (.zip)'}
      </Boton>
      <Boton variante="fantasma" disabled={generando} onClick={quitar}>
        Quitar selección
      </Boton>
    </div>
  )
}
