import { Zip } from 'reicon-react'
import { useState } from 'react'
import { descargarDeclaracionesZip } from '../../../../lib/pdfDeclaracion'
import { useDatos } from '../../../../store'
import { hoy } from '../../../../utils'
import { Boton } from '../../../atoms'
import type { DescargaDeclaracionesProps } from './DescargaDeclaraciones.types'

/** Descarga en PDF, dentro de un .zip, las declaraciones marcadas. Siempre está a la vista; sin marcadas, está apagado. */
export default function DescargaDeclaraciones({ declaraciones }: DescargaDeclaracionesProps) {
  const [generando, setGenerando] = useState(false)
  const cuantas = declaraciones.length

  const descargar = async () => {
    setGenerando(true)
    try {
      await descargarDeclaracionesZip(
        declaraciones,
        useDatos.getState(),
        `declaraciones_${hoy()}.zip`,
      )
    } finally {
      setGenerando(false)
    }
  }

  return (
    <Boton
      variante="primario"
      disabled={generando || cuantas === 0}
      title={
        cuantas === 0 ? 'Marca en la tabla las declaraciones que quieres descargar' : undefined
      }
      onClick={descargar}
    >
      <Zip className="size-4" aria-hidden />{' '}
      {generando ? 'Generando PDF…' : `Descargar PDF (.zip)${cuantas > 0 ? ` · ${cuantas}` : ''}`}
    </Boton>
  )
}
