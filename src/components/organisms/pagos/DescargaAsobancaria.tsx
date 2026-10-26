import { DocumentDownload } from 'reicon-react'
import { useState } from 'react'
import { descargarAsobancaria } from '../../../lib/asobancaria'
import type { Declaracion } from '../../../types'
import { Boton, Card, Input } from '../../atoms'
import { Campo, CardHeader } from '../../molecules'

const hoy = () => new Date().toISOString().slice(0, 10)

/** Archivo de recaudo de un solo día; en la demo trae datos de prueba. */
export default function DescargaAsobancaria({ declaraciones }: { declaraciones: Declaracion[] }) {
  const [fecha, setFecha] = useState(hoy)

  return (
    <Card>
      <CardHeader titulo="Descargar Asobancaria 2001" descripcion="El archivo de recaudo de un día. Se descarga un solo día a la vez." />
      <div className="space-y-4 p-5">
        <Campo etiqueta="Fecha de recaudo">
          <Input type="date" max={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Campo>
        <Boton variante="primario" disabled={!fecha} onClick={() => descargarAsobancaria(fecha, declaraciones)}>
          <DocumentDownload className="size-4" aria-hidden /> Descargar archivo
        </Boton>
      </div>
    </Card>
  )
}
