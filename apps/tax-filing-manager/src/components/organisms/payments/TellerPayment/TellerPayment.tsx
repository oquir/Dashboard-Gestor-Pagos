import { MoneyReceive, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { formatPesos } from '../../../../lib'
import { useData } from '../../../../store'
import { Button, Card, Input, Select } from '../../../atoms'
import { Notice, Field, CardHeader, SegmentedControl } from '../../../molecules'
import { BANKS, METHODS } from './TellerPayment.constants'
import type { Method, TellerPaymentProps, Recorded } from './TellerPayment.types'

/**
 * Pago en la ventanilla del municipio: el contribuyente no pagó en el banco ni en línea,
 * o pagó una parte y lleva el resto. Se registra con el número del recibo de caja.
 * Efectivo y cheque de gerencia se activan por formulario; el cheque queda en canje.
 */
export default function TellerPayment({ d, balance, methods, partialCheck }: TellerPaymentProps) {
  const recordTellerPayment = useData((s) => s.recordTellerPayment)
  const receiveCheck = useData((s) => s.receiveCheck)
  const [method, setMethod] = useState<Method>(methods.cash ? 'cash' : 'check')
  const [value, setValue] = useState(String(balance))
  const [receipt, setReceipt] = useState('')
  const [bank, setBank] = useState('')
  const [number, setNumber] = useState('')
  const [recorded, setRecorded] = useState<Recorded | null>(null)

  if (balance <= 0 && !recorded) return null

  const withCheck = methods.check && (method === 'check' || !methods.cash)
  // Sin cheques por valor parcial, el cheque cubre el saldo completo.
  const fixedValue = withCheck && !partialCheck
  const v = fixedValue ? balance : Number(value)
  const valueError =
    v > balance ? `Supera el saldo pendiente de ${formatPesos(balance)}.` : undefined
  const valid =
    v > 0 &&
    !valueError &&
    receipt.trim() !== '' &&
    (!withCheck || (bank !== '' && number.trim() !== ''))

  const valueHelp = fixedValue
    ? 'El municipio no recibe cheques por valor parcial: el cheque debe cubrir el saldo pendiente.'
    : `Saldo pendiente: ${formatPesos(balance)}. ${d.tax === 'ica' ? 'El ICA anual admite pago parcial.' : 'Solo el pago total le da efecto a la declaración.'}`

  const record = () => {
    if (withCheck)
      receiveCheck(d.id, { value: v, bank, number: number.trim(), receipt: receipt.trim() })
    else recordTellerPayment(d.id, v, receipt.trim())
    setRecorded({
      method: withCheck ? 'check' : 'cash',
      value: v,
      receipt: receipt.trim(),
      balance: balance - v,
    })
    setValue(String(balance - v))
    setReceipt('')
    setBank('')
    setNumber('')
  }

  return (
    <Card>
      <CardHeader
        title="Registrar pago en ventanilla"
        description={`Para el contribuyente que paga ${methods.cash && methods.check ? 'en efectivo o con cheque de gerencia' : methods.cash ? 'en efectivo' : 'con cheque de gerencia'} en la ventanilla del municipio, sea el total o lo que le falta.`}
      />
      <div className="space-y-4 p-5">
        {recorded && (
          <Notice tone="success" icon={TickCircle} role="status">
            {recorded.method === 'check' ? (
              <>
                <p className="font-medium">
                  Se recibió el cheque de gerencia por {formatPesos(recorded.value)} con el recibo{' '}
                  {recorded.receipt}.
                </p>
                <p className="mt-0.5">
                  Queda en canje: cuenta como pago, con la fecha de hoy, cuando se confirme que el
                  banco lo pagó.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">
                  Se registró el pago de {formatPesos(recorded.value)} con el recibo{' '}
                  {recorded.receipt}.
                </p>
                <p className="mt-0.5">
                  {recorded.balance > 0
                    ? `Saldo pendiente: ${formatPesos(recorded.balance)}.`
                    : 'La declaración quedó pagada.'}
                </p>
              </>
            )}
          </Notice>
        )}

        {balance > 0 && (
          <>
            {methods.cash && methods.check && (
              <SegmentedControl
                label="Medio de pago"
                options={METHODS}
                value={method}
                change={setMethod}
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={withCheck ? 'Valor del cheque' : 'Valor recibido'}
                error={valueError}
                help={valueHelp}
              >
                <Input
                  type="number"
                  min={1}
                  max={balance}
                  disabled={fixedValue}
                  value={fixedValue ? balance : value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </Field>
              <Field label="Número del recibo de caja">
                <Input
                  value={receipt}
                  onChange={(e) => setReceipt(e.target.value)}
                  placeholder="Ej.: RC-004512"
                />
              </Field>
              {withCheck && (
                <>
                  <Field label="Banco que expidió el cheque">
                    <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                      <option value="">Elige el banco</option>
                      {BANKS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Número del cheque">
                    <Input
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      inputMode="numeric"
                    />
                  </Field>
                </>
              )}
            </div>
            <Button variant="primary" disabled={!valid} onClick={record}>
              <MoneyReceive className="size-4" aria-hidden />{' '}
              {withCheck ? 'Recibir cheque' : 'Registrar pago'}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
