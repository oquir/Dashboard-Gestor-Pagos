import { DocumentDownload } from 'reicon-react'
import { useState } from 'react'
import { downloadAsobancaria } from '../../../../lib'
import { today } from '../../../../utils'
import { Button, Card, Input } from '../../../atoms'
import { Field, CardHeader } from '../../../molecules'
import type { AsobancariaDownloadProps } from './AsobancariaDownload.types'

/** Archivo de recaudo de un solo día; en la demo trae datos de prueba. */
export default function AsobancariaDownload({ declarations }: AsobancariaDownloadProps) {
  const [date, setDate] = useState(today)

  return (
    <Card>
      <CardHeader
        title="Descargar Asobancaria 2001"
        description="El archivo de recaudo de un día. Se descarga un solo día a la vez."
      />
      <div className="space-y-4 p-5">
        <Field label="Fecha de recaudo">
          <Input type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button
          variant="primary"
          disabled={!date}
          onClick={() => downloadAsobancaria(date, declarations)}
        >
          <DocumentDownload className="size-4" aria-hidden /> Descargar archivo
        </Button>
      </div>
    </Card>
  )
}
