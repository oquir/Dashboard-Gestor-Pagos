import { MoneyReceive, TickCircle } from 'reicon-react'
import { useState } from 'react'
import { formatoPesos } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Boton, Card, Input, Select } from '../../../atoms'
import { Aviso, Campo, CardHeader, Segmentado } from '../../../molecules'
import { BANCOS, MEDIOS } from './constants'
import type { Medio, PagoVentanillaProps, Registrado } from './types'

/**
 * Pago en la ventanilla del municipio: el contribuyente no pagó en el banco ni en línea,
 * o pagó una parte y lleva el resto. Se registra con el número del recibo de caja.
 * Efectivo y cheque de gerencia se activan por formulario; el cheque queda en canje.
 */
export default function PagoVentanilla({ d, saldo, medios, chequeParcial }: PagoVentanillaProps) {
  const registrarPagoVentanilla = useDatos((s) => s.registrarPagoVentanilla)
  const recibirCheque = useDatos((s) => s.recibirCheque)
  const [medio, setMedio] = useState<Medio>(medios.efectivo ? 'efectivo' : 'cheque')
  const [valor, setValor] = useState(String(saldo))
  const [recibo, setRecibo] = useState('')
  const [banco, setBanco] = useState('')
  const [numero, setNumero] = useState('')
  const [registrado, setRegistrado] = useState<Registrado | null>(null)

  if (saldo <= 0 && !registrado) return null

  const conCheque = medios.cheque && (medio === 'cheque' || !medios.efectivo)
  // Sin cheques por valor parcial, el cheque cubre el saldo completo.
  const valorFijo = conCheque && !chequeParcial
  const v = valorFijo ? saldo : Number(valor)
  const errorValor = v > saldo ? `Supera el saldo pendiente de ${formatoPesos(saldo)}.` : undefined
  const valido = v > 0 && !errorValor && recibo.trim() !== '' && (!conCheque || (banco !== '' && numero.trim() !== ''))

  const ayudaValor = valorFijo
    ? 'El municipio no recibe cheques por valor parcial: el cheque debe cubrir el saldo pendiente.'
    : `Saldo pendiente: ${formatoPesos(saldo)}. ${d.impuesto === 'ica' ? 'El ICA anual admite pago parcial.' : 'Sin el pago total, la declaración sigue ineficaz.'}`

  const registrar = () => {
    if (conCheque) recibirCheque(d.id, { valor: v, banco, numero: numero.trim(), recibo: recibo.trim() })
    else registrarPagoVentanilla(d.id, v, recibo.trim())
    setRegistrado({ medio: conCheque ? 'cheque' : 'efectivo', valor: v, recibo: recibo.trim(), saldo: saldo - v })
    setValor(String(saldo - v))
    setRecibo('')
    setBanco('')
    setNumero('')
  }

  return (
    <Card>
      <CardHeader
        titulo="Registrar pago en ventanilla"
        descripcion={`Para el contribuyente que paga ${medios.efectivo && medios.cheque ? 'en efectivo o con cheque de gerencia' : medios.efectivo ? 'en efectivo' : 'con cheque de gerencia'} en la ventanilla del municipio, sea el total o lo que le falta.`}
      />
      <div className="space-y-4 p-5">
        {registrado && (
          <Aviso tono="exito" icono={TickCircle} rol="status">
            {registrado.medio === 'cheque' ? (
              <>
                <p className="font-medium">
                  Se recibió el cheque de gerencia por {formatoPesos(registrado.valor)} con el recibo {registrado.recibo}.
                </p>
                <p className="mt-0.5">Queda en canje: cuenta como pago, con la fecha de hoy, cuando se confirme que el banco lo pagó.</p>
              </>
            ) : (
              <>
                <p className="font-medium">
                  Se registró el pago de {formatoPesos(registrado.valor)} con el recibo {registrado.recibo}.
                </p>
                <p className="mt-0.5">{registrado.saldo > 0 ? `Saldo pendiente: ${formatoPesos(registrado.saldo)}.` : 'La declaración quedó pagada.'}</p>
              </>
            )}
          </Aviso>
        )}

        {saldo > 0 && (
          <>
            {medios.efectivo && medios.cheque && <Segmentado etiqueta="Medio de pago" opciones={MEDIOS} valor={medio} cambiar={setMedio} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta={conCheque ? 'Valor del cheque' : 'Valor recibido'} error={errorValor} ayuda={ayudaValor}>
                <Input type="number" min={1} max={saldo} disabled={valorFijo} value={valorFijo ? saldo : valor} onChange={(e) => setValor(e.target.value)} />
              </Campo>
              <Campo etiqueta="Número del recibo de caja">
                <Input value={recibo} onChange={(e) => setRecibo(e.target.value)} placeholder="Ej.: RC-004512" />
              </Campo>
              {conCheque && (
                <>
                  <Campo etiqueta="Banco que expidió el cheque">
                    <Select value={banco} onChange={(e) => setBanco(e.target.value)}>
                      <option value="">Elige el banco</option>
                      {BANCOS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </Select>
                  </Campo>
                  <Campo etiqueta="Número del cheque">
                    <Input value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="numeric" />
                  </Campo>
                </>
              )}
            </div>
            <Boton variante="primario" disabled={!valido} onClick={registrar}>
              <MoneyReceive className="size-4" aria-hidden /> {conCheque ? 'Recibir cheque' : 'Registrar pago'}
            </Boton>
          </>
        )}
      </div>
    </Card>
  )
}
