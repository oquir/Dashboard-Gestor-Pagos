import { useState, type FormEvent } from 'react'
import { Button, Card } from '../../atoms'
import DateRange from '../DateRange'
import type { DateQueryBarProps } from './DateQueryBar.types'

/**
 * El rango de fechas que pide una página antes de mostrar los datos. Las fechas se escriben en borrador y la tabla solo
 * cambia al presionar Consultar.
 */
export default function DateQueryBar({ query, consult, criterion }: DateQueryBarProps) {
  const [from, setFrom] = useState(query?.from ?? '')
  const [to, setTo] = useState(query?.to ?? '')
  const invalid = !from || !to || from > to
  const consulted = query?.from === from && query?.to === to

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!invalid) consult(from, to)
  }

  return (
    <Card className="mb-6 p-4">
      <form className="flex flex-wrap items-start gap-3" onSubmit={submit}>
        <DateRange from={from} to={to} changeFrom={setFrom} changeTo={setTo} />
        {/* El margen alinea el botón con los campos, debajo de sus etiquetas. */}
        <Button type="submit" variant="primary" className="mt-6" disabled={invalid || consulted}>
          Consultar
        </Button>
      </form>
      <p className="mt-2 text-xs text-slate-500">{criterion}</p>
    </Card>
  )
}
