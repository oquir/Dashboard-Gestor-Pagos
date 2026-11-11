import { Zip } from 'reicon-react'
import { useState } from 'react'
import { downloadDeclarationsZip } from '../../../../lib'
import { useData } from '../../../../store'
import { today } from '../../../../utils'
import { Button } from '../../../atoms'
import type { DeclarationsDownloadProps } from './DeclarationsDownload.types'

/** Descarga en PDF, dentro de un .zip, las declaraciones marcadas. Siempre está a la vista; sin marcadas, está apagado. */
export default function DeclarationsDownload({ declarations }: DeclarationsDownloadProps) {
  const [generating, setGenerating] = useState(false)
  const howMany = declarations.length

  const download = async () => {
    setGenerating(true)
    try {
      await downloadDeclarationsZip(
        declarations,
        useData.getState(),
        `declaraciones_${today()}.zip`,
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button
      variant="primary"
      disabled={generating || howMany === 0}
      title={
        howMany === 0 ? 'Marca en la tabla las declaraciones que quieres descargar' : undefined
      }
      onClick={download}
    >
      <Zip className="size-4" aria-hidden />{' '}
      {generating ? 'Generando PDF…' : `Descargar PDF (.zip)${howMany > 0 ? ` · ${howMany}` : ''}`}
    </Button>
  )
}
