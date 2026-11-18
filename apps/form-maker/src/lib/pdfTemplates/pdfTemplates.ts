import { v4 as uuidv4 } from 'uuid'
import { PDF_DEFAULT_FONT, PDF_NO_EXTRA_MARGINS } from '../../constants'
import type { PdfCell, PdfDesign, PdfRow, PdfTable, PdfTaxType } from '../../types'
import {
  ICA_ACTIVITY_COUNT,
  ICA_CLASSES,
  ICA_COLUMN_WIDTHS,
  ICA_FONT_SIZE,
  ICA_LABEL_HEIGHTS,
  ICA_TABLE_STYLE,
} from './pdfTemplates.constants'
import { ICA_SECTION_IMAGES } from './pdfTemplates.data'
import { bare, html, image, nested, row, table, text } from './pdfTemplates.utils'

// Las plantillas de fabrica del PDF: con lo que arranca el diseñador de un impuesto que todavia no
// tiene nada guardado, y lo que trae el boton "Plantilla de fábrica". Hoy solo el ICA.
//
// La del ICA es la generica de Autoliquidables (GENERICO\PdfICA.html) rehecha con tablas del
// editor, para que se pueda tocar celda por celda, y en UNA hoja carta: la original eran dos (la
// segunda, las actividades 4 a 15) y estaba medida para una ventana de 1960 px. Cambios a proposito:
// - las 15 actividades van en la seccion C (antes 3 + "OTRAS ACTIVIDADES / VER DESAGREGACIÓN");
// - la rejilla es de 10 columnas (la original mezclaba filas de 12 y de 10);
// - letra de 8 px y rotulos mas chicos, a la escala de los 778 px;
// - se corrigen INDUSTRÍA, MUNIPIO y AUTORETENCIONES;
// - el estilo va en clases del diseño (ICA_CLASSES: "celda negrita derecha"…), no en cada celda: asi
//   el .html dice una vez como es una celda del FUN y no 250.
// Las variables son las de hoy ({RazonSocial}, {CodigoSecundaria1}…): el back actual las llena tal
// cual. Pasarlas a los nombres de los campos es del inventario (docs/Pendientes-PDF.md §3.7).
// Solo la usa el diseñador (chunk perezoso): fuera de lib/index.ts.

export function factoryPdfDesign(taxType: PdfTaxType): PdfDesign | null {
  if (taxType !== 'industria_comercio') return null
  return {
    taxType,
    fontFamily: PDF_DEFAULT_FONT,
    fontSize: ICA_FONT_SIZE,
    margins: PDF_NO_EXTRA_MARGINS,
    classes: structuredClone(ICA_CLASSES),
    sheets: [{ id: uuidv4(), blocks: [{ ...icaTable(), kind: 'table' }] }],
  }
}

export function hasFactoryPdfDesign(taxType: PdfTaxType): boolean {
  return taxType === 'industria_comercio'
}

function icaTable(): PdfTable {
  const main: PdfTable = table(ICA_COLUMN_WIDTHS, [
    ...heading(),
    ...sectionInformacion(),
    ...sectionBaseGravable(),
    ...sectionActividades(),
    ...sectionLiquidacion(),
    ...sectionPago(),
    ...sectionPagoVoluntario(),
    ...sectionFirmas(),
  ])
  return { ...main, style: ICA_TABLE_STYLE }
}

function heading(): PdfRow[] {
  return [
    row([
      text('FORMULARIO ÚNICO NACIONAL DE DECLARACIÓN Y PAGO DEL IMPUESTO DE INDUSTRIA Y COMERCIO', {
        colSpan: 10,
        bold: true,
        align: 'center',
        gray: true,
        title: true,
      }),
    ]),
    row([
      text('MUNICIPIO O DISTRITO:', { colSpan: 3, bold: true, align: 'right' }),
      text('{Ciudad}', { colSpan: 4, bold: true }),
      html('<strong>Fecha máxima presentación</strong><br>{FechaMaxima}', {
        colSpan: 3,
        rowSpan: 2,
        align: 'center',
      }),
    ]),
    row([
      text('DEPARTAMENTO:', { colSpan: 3, bold: true, align: 'right' }),
      text('{Departamento}', { colSpan: 4, bold: true }),
    ]),
    row([
      text('AÑO GRAVABLE:', { colSpan: 3, bold: true, align: 'right' }),
      text('{Anio}', { bold: true }),
      text('SOLAMENTE PARA BOGOTÁ, marque el bimestre o el periodo anual', { bold: true }),
      nested(bimestres(), { colSpan: 5 }),
    ]),
    row([
      text('OPCIÓN DE USO:', { colSpan: 3, bold: true, align: 'right' }),
      nested(
        table(
          [118, 100, 82, undefined, undefined],
          [
            row([
              bare('DECLARACIÓN INICIAL <strong>__{Ini}__</strong>'),
              bare('CORRECCIÓN <strong>__{Corr}__</strong>'),
              bare('CLAUSURA <strong>__{Cla}__</strong>'),
              bare('Declaración que corrige No. {NumeroDeclaracionCorrige}'),
              bare('Fecha: {FechaPresentacionDeclaracionAnterior}'),
            ]),
          ],
        ),
        { colSpan: 7 },
      ),
    ]),
  ]
}

function bimestres(): PdfTable {
  const periods: [string, string, string][] = [
    ['ene-feb', '1', '{EneFebre}'],
    ['mar-abr', '2', '{MarAbr}'],
    ['may-jun', '3', '{MayJun}'],
    ['jul-ago', '4', '{JulAgos}'],
    ['sep-oct', '5', '{SepOct}'],
    ['nov-dic', '6', '{NovDic}'],
    ['Anual', '7', '{Anual}'],
  ]
  // El numero va arriba con el periodo: al lado de la variable no cabe en las 7 columnas.
  return table(
    periods.map(() => undefined),
    [
      row(periods.map(([label, number]) => bare(`${number}. ${label}`, { align: 'center' }))),
      row(
        periods.map(([, , variable]) => bare(`<strong>${variable}</strong>`, { align: 'center' })),
      ),
    ],
  )
}

function sectionInformacion(): PdfRow[] {
  return [
    row([
      label(ICA_SECTION_IMAGES.informacion, ICA_LABEL_HEIGHTS.informacion, 5),
      number('1'),
      text('NOMBRES Y APELLIDOS O RAZÓN SOCIAL:', { colSpan: 2, bold: true }),
      text('{RazonSocial}', { colSpan: 6 }),
    ]),
    row([
      number('2'),
      nested(
        table(
          [62, 66, 58, 60, undefined, 50],
          [
            row([
              bare('<strong>CC:</strong> <strong>__{CC}__</strong>'),
              bare('<strong>NIT:</strong> <strong>__{NIT}__</strong>'),
              bare('<strong>TI:</strong> <strong>__{TI}__</strong>'),
              bare('<strong>CE:</strong> <strong>__{CE}__</strong>'),
              bare('<strong>No.</strong> {Identificacion}'),
              bare('<strong>DV:</strong> {DV}'),
            ]),
          ],
        ),
        { colSpan: 4 },
      ),
      nested(
        table(
          [undefined, undefined],
          [
            row([
              bare('<strong>Es Consorcio o Unión Temporal: __{Consor}__</strong>'),
              bare(
                '<strong>Realiza actividades a través de Patrimonio Autónomo: __{PatAu}__</strong>',
              ),
            ]),
          ],
        ),
        { colSpan: 4 },
      ),
    ]),
    row([
      number('3', 2),
      text('DIRECCIÓN DE NOTIFICACIÓN:', { colSpan: 2, bold: true }),
      text('{Direccion}', { colSpan: 6 }),
    ]),
    row([
      text('MUNICIPIO O DISTRITO DE LA DIRECCIÓN:', { colSpan: 2, bold: true }),
      text('{MunDir}', { colSpan: 2 }),
      text('DEPARTAMENTO:', { colSpan: 2, bold: true }),
      text('{DepDir}', { colSpan: 2 }),
    ]),
    // Rotulo y valor juntos en cada celda: separados, la columna del valor quedaba angosta para un
    // correo.
    row([
      number('4'),
      html('<strong>TELÉFONO:</strong> {Telefono}'),
      html('<strong>5. CORREO ELECTRÓNICO:</strong> {Correo}', { colSpan: 2 }),
      html('<strong>6. No. ESTABLECIMIENTOS:</strong> {NroEstablecimientos}', { colSpan: 3 }),
      html('<strong>7. CLASIFICACIÓN:</strong> {Clasificacion}', { colSpan: 2 }),
    ]),
  ]
}

function sectionBaseGravable(): PdfRow[] {
  const lines: [string, string, string, Line][] = [
    [
      '8',
      'TOTAL INGRESOS ORDINARIOS Y EXTRAORDINARIOS DEL PERIODO EN TODO EL PAÍS',
      '{IngresosOrdinarios}',
      'bold',
    ],
    ['9', 'MENOS INGRESOS FUERA DE ESTE MUNICIPIO O DISTRITO', '{IngresosFueraMunicipio}', 'less'],
    [
      '10',
      'TOTAL INGRESOS ORDINARIOS Y EXTRAORDINARIOS EN ESTE MUNICIPIO (RENGLÓN 8 MENOS 9)',
      '{TotalIngresosOrdinarios}',
      'bold',
    ],
    [
      '11',
      'MENOS INGRESOS POR DEVOLUCIONES, REBAJAS, DESCUENTOS',
      '{DevolucionDescuentos}',
      'less',
    ],
    ['12', 'MENOS INGRESOS POR EXPORTACIONES', '{Exportaciones}', 'less'],
    ['13', 'MENOS INGRESOS POR VENTA DE ACTIVOS FIJOS', '{ActivosFijos}', 'less'],
    [
      '14',
      'MENOS INGRESOS POR ACTIVIDADES EXCLUIDAS O NO SUJETAS Y OTROS INGRESOS NO GRAVADOS',
      '{ActividadesExcluidas}',
      'less',
    ],
    [
      '15',
      'MENOS INGRESOS POR OTRAS ACTIVIDADES EXENTAS EN ESTE MUNICIPIO O DISTRITO (POR ACUERDO)',
      '{ActividadesExentas}',
      'less',
    ],
    [
      '16',
      'TOTAL INGRESOS GRAVABLES (RENGLÓN 10 MENOS 11, 12, 13, 14 Y 15)',
      '{IngresosGravables}',
      'bold',
    ],
  ]
  return lines.map((line, index) =>
    renglon(
      line,
      index === 0
        ? label(ICA_SECTION_IMAGES.baseGravable, ICA_LABEL_HEIGHTS.baseGravable, lines.length)
        : null,
    ),
  )
}

function sectionActividades(): PdfRow[] {
  const activities: PdfRow[] = Array.from({ length: ICA_ACTIVITY_COUNT }, (_, index) => {
    const isMain: boolean = index === 0
    const suffix: string = isMain ? 'Principal' : `Secundaria${index}`
    return row([
      text(isMain ? 'ACTIVIDAD 1 (PRINCIPAL)' : `ACTIVIDAD ${index + 1}`, { colSpan: 2 }),
      text(`{Codigo${suffix}}`, { bold: true, align: 'center' }),
      text(`{IngresosNetosGravables${suffix}}`, { bold: true, align: 'right' }),
      text(`{TarifaXMil${suffix}}`, { colSpan: 2, bold: true, align: 'center' }),
      text(`{Impuesto${index + 1}}`, { colSpan: 3, bold: true, align: 'right' }),
    ])
  })
  const rowCount: number = activities.length + 3

  return [
    row([
      label(ICA_SECTION_IMAGES.actividades, ICA_LABEL_HEIGHTS.actividades, rowCount),
      text('ACTIVIDADES GRAVADAS', { colSpan: 2, bold: true, align: 'center' }),
      text('CÓDIGO CIIU', { bold: true, align: 'center' }),
      text('INGRESOS GRAVADOS', { bold: true, align: 'center' }),
      text('TARIFA (por mil)', { colSpan: 2, bold: true, align: 'center' }),
      text('IMPUESTO', { colSpan: 3, bold: true, align: 'center' }),
    ]),
    ...activities,
    row([
      text('TOTAL DE INGRESOS GRAVADOS', { colSpan: 3, bold: true, align: 'center' }),
      text('{TotalIngresosGravados}', { bold: true, align: 'right' }),
      text('17. TOTAL IMPUESTO', { colSpan: 2, bold: true, align: 'center' }),
      text('{TotalImpuestos}', { colSpan: 3, bold: true, align: 'right' }),
    ]),
    row([
      number('18'),
      html('GENERACIÓN DE ENERGÍA - CAPACIDAD INSTALADA: <strong>{Energia} KW</strong>', {
        colSpan: 3,
      }),
      text('19. IMPUESTO LEY 55 DE 1981', { colSpan: 2 }),
      text('{ImpuestoLey}', { colSpan: 3, bold: true, align: 'right' }),
    ]),
  ]
}

function sectionLiquidacion(): PdfRow[] {
  const lines: [string, string, string, Line][] = [
    ['20', 'TOTAL IMPUESTO DE INDUSTRIA Y COMERCIO (RENGLÓN 17 + 19)', '{ImpIndYComercio}', 'bold'],
    ['21', 'IMPUESTO DE AVISOS Y TABLEROS (15% DEL RENGLÓN 20)', '{ImpAvisosyTableros}', 'plain'],
    [
      '22',
      'PAGO POR UNIDADES COMERCIALES ADICIONALES DEL SECTOR FINANCIERO',
      '{UnidadesComerciales}',
      'plain',
    ],
    [
      '23',
      'SOBRETASA BOMBERIL (Ley 1575 de 2012) (Si la hay, liquídela según el acuerdo municipal o distrital)',
      '{Sobretasa}',
      'plain',
    ],
    [
      '24',
      'SOBRETASA DE SEGURIDAD (Ley 1421 de 2011) (Si la hay, liquídela según el acuerdo municipal o distrital)',
      '{SobretasaSeguridad}',
      'plain',
    ],
    ['25', 'TOTAL DE IMPUESTOS A CARGO (RENGLÓN 20+21+22+23+24)', '{TotalImpuestoCargo}', 'bold'],
    [
      '26',
      'MENOS VALOR DE EXENCIÓN O EXONERACIÓN SOBRE EL IMPUESTO Y NO SOBRE LOS INGRESOS',
      '{ValorExencion}',
      'less',
    ],
    [
      '27',
      'MENOS RETENCIONES QUE LE PRACTICARON A FAVOR DE ESTE MUNICIPIO O DISTRITO EN ESTE PERIODO',
      '{Retenciones}',
      'less',
    ],
    [
      '28',
      'MENOS AUTORRETENCIONES PRACTICADAS A FAVOR DE ESTE MUNICIPIO O DISTRITO EN ESTE PERIODO',
      '{Autorretenciones}',
      'less',
    ],
    ['29', 'MENOS ANTICIPO LIQUIDADO EN EL AÑO ANTERIOR', '{AnticipoLiquidado}', 'less'],
    [
      '30',
      'ANTICIPO DEL AÑO SIGUIENTE (Si existe, liquide el porcentaje según el acuerdo municipal o distrital)',
      '{AnticipoImpuesto}',
      'plain',
    ],
    ['31', '', '{Sanciones}', 'plain'],
    [
      '32',
      'MENOS SALDO A FAVOR DEL PERIODO ANTERIOR SIN SOLICITUD DE DEVOLUCIÓN O COMPENSACIÓN',
      '{SaldoPeriodo}',
      'less',
    ],
    ['33', 'TOTAL SALDO A CARGO (RENGLÓN 25-26-27-28-29+30+31-32)', '{TotalSaldoCargo}', 'bold'],
    [
      '34',
      'TOTAL SALDO A FAVOR (RENGLÓN 25-26-27-28-29+30+31-32) SI EL RESULTADO ES MENOR A CERO',
      '{TotalSaldoFavor}',
      'bold',
    ],
  ]
  return lines.map((line, index) => {
    const first: PdfCell | null =
      index === 0
        ? label(ICA_SECTION_IMAGES.liquidacion, ICA_LABEL_HEIGHTS.liquidacion, lines.length)
        : null
    // El 31 lleva las casillas del tipo de sancion en vez de un texto.
    if (line[0] === '31') {
      return row([
        number('31'),
        html(
          'SANCIONES: &nbsp; Extemporaneidad <strong>__{Ext}__</strong> &nbsp; Corrección <strong>__{Cor}__</strong> &nbsp; Inexactitud <strong>__{Ine}__</strong> &nbsp; Otra <strong>__{Otr}__</strong> &nbsp; Cuál: <strong>{OtraSancion}</strong>',
          { colSpan: 5 },
        ),
        text(line[2], { colSpan: 3, bold: true, align: 'right' }),
      ])
    }
    return renglon(line, first)
  })
}

function sectionPago(): PdfRow[] {
  const lines: [string, string, string, Line][] = [
    ['35', 'VALOR A PAGAR', '{ValorPagar}', 'bold'],
    [
      '36',
      'DESCUENTO POR PRONTO PAGO (Si existe, liquídelo según el acuerdo municipal o distrital)',
      '{Descuento}',
      'plain',
    ],
    ['37', 'INTERÉS DE MORA', '{InteresMora}', 'plain'],
    ['38', 'TOTAL A PAGAR (RENGLÓN 35-36+37)', '{TotalAPagar}', 'bold'],
  ]
  return lines.map((line, index) =>
    renglon(
      line,
      index === 0 ? label(ICA_SECTION_IMAGES.pago, ICA_LABEL_HEIGHTS.pago, lines.length) : null,
    ),
  )
}

function sectionPagoVoluntario(): PdfRow[] {
  return [
    row([
      html('SECCIÓN<br>PAGO<br>VOLUNTARIO', {
        colSpan: 2,
        rowSpan: 3,
        bold: true,
        align: 'center',
        gray: true,
        fontSize: 7,
      }),
      html(
        '<strong>39.</strong> LIQUIDE EL VALOR DEL PAGO VOLUNTARIO (Según instrucciones del municipio o distrito)',
        { colSpan: 5 },
      ),
      text('{PagoVoluntario}', { colSpan: 3, bold: true, align: 'right' }),
    ]),
    row([
      text('40. TOTAL A PAGAR CON PAGO VOLUNTARIO (RENGLÓN 38+39)', { colSpan: 5, bold: true }),
      text('{TotalPagoVoluntario}', { colSpan: 3, bold: true, align: 'right' }),
    ]),
    row([
      text('DESTINO DE MI APORTE VOLUNTARIO', { colSpan: 5 }),
      text('{Destino}', { colSpan: 3, bold: true, align: 'right' }),
    ]),
  ]
}

function sectionFirmas(): PdfRow[] {
  const signatureLine: string = '<br><br>______________________________________________'
  return [
    row([
      label(ICA_SECTION_IMAGES.firmas, ICA_LABEL_HEIGHTS.firmas, 3),
      html(`<strong>FIRMA DECLARANTE</strong>${signatureLine}`, {
        colSpan: 4,
        verticalAlign: 'top',
      }),
      html(
        `<strong>FIRMA DEL CONTADOR __{FirmaContador}__ &nbsp; &nbsp; REVISOR FISCAL __{FirmaRevisor}__</strong>${signatureLine}`,
        { colSpan: 5, verticalAlign: 'top' },
      ),
    ]),
    row([
      text('NOMBRE: {Representante}', { colSpan: 4, bold: true }),
      text('NOMBRE: {NombreContador}', { colSpan: 5, bold: true }),
    ]),
    row([
      html('<strong>CC</strong> &nbsp; <strong>No.</strong> <strong>{DocRepresentante}</strong>', {
        colSpan: 4,
      }),
      html(
        '<strong>CC</strong> &nbsp; <strong>No.</strong> <strong>{DocContador}</strong> &nbsp; &nbsp; <strong>T.P.</strong> <strong>{TarjetaProfesional}</strong>',
        { colSpan: 5 },
      ),
    ]),
    // El codigo de barras lo pone el back en {Code}. Se aplasta a lo alto a proposito: un codigo de
    // barras se lee a lo ancho, y su ancho no se toca.
    row([
      html('<img src="{Code}" style="width: 100%; height: 40px" alt="">', {
        colSpan: 5,
        align: 'center',
      }),
      html('FORMULARIO No. <strong>{NroRadicado}</strong>', { colSpan: 5, align: 'center' }),
    ]),
    row(
      [
        text('ESPACIO PARA CÓDIGO QR', { colSpan: 3, align: 'center' }),
        text('ESPACIO PARA SELLO O TIMBRE', { colSpan: 2, align: 'center' }),
        text(
          'ESPACIO PARA SERIAL AUTOMÁTICO DE TRANSACCIÓN O MECANISMO DE IDENTIFICACIÓN DE RECAUDO',
          { colSpan: 5, align: 'center' },
        ),
      ],
      30,
    ),
  ]
}

// bold: renglon de total; less: "MENOS …", corrido a la derecha; plain: texto normal.
type Line = 'bold' | 'less' | 'plain'

function renglon(
  [num, caption, variable, kind]: [string, string, string, Line],
  first: PdfCell | null,
): PdfRow {
  return row([
    ...(first ? [first] : []),
    number(num),
    text(caption, {
      colSpan: 5,
      bold: kind === 'bold',
      indent: kind === 'less',
    }),
    text(variable, { colSpan: 3, bold: true, align: 'right' }),
  ])
}

function number(value: string, rowSpan: number = 1): PdfCell {
  return text(value, { bold: true, align: 'center', rowSpan })
}

function label(src: string, height: number, rowSpan: number): PdfCell {
  return html(image(src, height), { rowSpan, align: 'center' })
}
