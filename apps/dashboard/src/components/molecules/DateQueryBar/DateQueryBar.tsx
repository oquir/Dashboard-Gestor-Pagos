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
      <form className="flex flex-col items-center gap-4" onSubmit={submit}>
        {/* Dos campos medianos, lado a lado; en el celular, uno debajo del otro. */}
        <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
          <DateRange from={from} to={to} changeFrom={setFrom} changeTo={setTo} />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="min-w-40"
          disabled={invalid || consulted}
        >
          Consultar
        </Button>
      </form>
      <p className="mt-3 text-center text-xs text-fg-muted">{criterion}</p>
    </Card>
  )
}
