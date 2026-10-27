import { MoneyReceive, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { formatoPesos } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Boton, Card, Input } from '../../../atoms'
import { Aviso, Campo, CardHeader } from '../../../molecules'
import type { PagoVentanillaProps, Registrado } from './types'

/**
 * Pago en efectivo en la ventanilla del municipio: el contribuyente no pagó en el banco ni en línea,
 * o pagó una parte y lleva el resto. Se registra con el número del recibo de caja.
 */
export default function PagoVentanilla({ d, saldo }: PagoVentanillaProps) {
  const registrarPagoVentanilla = useDatos((s) => s.registrarPagoVentanilla)
  const [valor, setValor] = useState(String(saldo))
  const [recibo, setRecibo] = useState('')
  const [registrado, setRegistrado] = useState<Registrado | null>(null)

  if (saldo <= 0 && !registrado) return null

  const v = Number(valor)
  const errorValor = v > saldo ? `Supera el saldo pendiente de ${formatoPesos(saldo)}.` : undefined
  const valido = v > 0 && !errorValor && recibo.trim() !== ''

  const registrar = () => {
    registrarPagoVentanilla(d.id, v, recibo.trim())
    setRegistrado({ valor: v, recibo: recibo.trim(), saldo: saldo - v })
    setValor(String(saldo - v))
    setRecibo('')
  }

  return (
    <Card>
      <CardHeader
        titulo="Registrar pago en ventanilla"
        descripcion="Para el contribuyente que paga en efectivo en la ventanilla del municipio, sea el total o lo que le falta."
      />
      <div className="space-y-4 p-5">
        {registrado && (
          <Aviso tono="exito" icono={TickCircle} rol="status">
            <p className="font-medium">
              Se registró el pago de {formatoPesos(registrado.valor)} con el recibo {registrado.recibo}.
            </p>
            <p className="mt-0.5">{registrado.saldo > 0 ? `Saldo pendiente: ${formatoPesos(registrado.saldo)}.` : 'La declaración quedó pagada.'}</p>
          </Aviso>
        )}

        {saldo > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                etiqueta="Valor recibido"
                error={errorValor}
                ayuda={d.impuesto === 'ica' ? `Saldo pendiente: ${formatoPesos(saldo)}. El ICA anual admite pago parcial.` : `Saldo pendiente: ${formatoPesos(saldo)}. Sin el pago total, la declaración sigue ineficaz.`}
              >
                <Input type="number" min={1} max={saldo} value={valor} onChange={(e) => setValor(e.target.value)} />
              </Campo>
              <Campo etiqueta="Número del recibo de caja">
                <Input value={recibo} onChange={(e) => setRecibo(e.target.value)} placeholder="Ej.: RC-004512" />
              </Campo>
            </div>
            <Boton variante="primario" disabled={!valido} onClick={registrar}>
              <MoneyReceive className="size-4" aria-hidden /> Registrar pago
            </Boton>
          </>
        )}
      </div>
    </Card>
  )
}
