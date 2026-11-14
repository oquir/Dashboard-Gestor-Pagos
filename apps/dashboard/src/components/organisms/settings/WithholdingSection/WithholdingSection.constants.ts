/** Lo que explica el globo de cada campo de ReteICA y AutoReteICA. */
export const WITHHOLDING_INFO = {
  reteicaModality:
    'Tarifa única: se retiene siempre el mismo valor por mil. Por actividad del proveedor: se usa la tarifa del ICA de la actividad de quien recibe el pago. Por concepto: la tarifa y la base mínima cambian según sea una compra o un servicio.',
  minBase:
    'Los pagos por debajo de esta base mínima no se retienen, y el renglón de la declaración lo dice.',
  selfWithholdingModality:
    'Tarifa plena: se autorretiene con la tarifa completa del ICA de la actividad. Porcentaje de la tarifa: se aplica solo una parte, que el municipio fija cada vigencia.',
  zeroDeclaration:
    'Encendido, un agente que no retuvo nada en el periodo igual debe presentar la declaración en ceros, y si no lo hace sale como omiso. Apagado, no declara y no se marca como omiso.',
  paymentInTwoMonths:
    'Sin el pago total, la declaración de retención no produce efecto (es ineficaz). Con este plazo, la que se presentó a tiempo vale si se paga completa, con intereses, dentro de los 2 meses siguientes al vencimiento (art. 580-1 del Estatuto Tributario).',
}
