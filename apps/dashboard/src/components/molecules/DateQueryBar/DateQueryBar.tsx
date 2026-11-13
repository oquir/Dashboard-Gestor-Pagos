import { useState, type FormEvent } from 'react'
import { InfoCircle } from 'reicon-react'
import { Button, Card } from '../../atoms'
import DateRange from '../DateRange'
import Tooltip from '../Tooltip'
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
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            className="min-w-40"
            disabled={invalid || consulted}
          >
            Consultar
          </Button>
          {/* Con qué fecha se filtra: en un globo, para no ocupar espacio debajo del botón. */}
          {criterion && (
            <Tooltip content={criterion}>
              <button
                type="button"
                aria-label="Con qué fecha se filtra"
                className="rounded-full p-1 text-fg-subtle hover:text-fg-strong focus-visible:outline-2 focus-visible:outline-brand-border"
              >
                <InfoCircle className="size-5" aria-hidden />
              </button>
            </Tooltip>
          )}
        </div>
      </form>
    </Card>
  )
}
