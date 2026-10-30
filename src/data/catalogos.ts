// Datos fijos del mock. Municipios, personas y empresas son ficticios.
import { nombreCompleto } from '../lib/formato'
import { SANCIONES_LEY } from '../lib/reglas'
import type { ActividadesVigencia, ConfigMunicipio, Municipio, Sector, Tarifa, Usuario } from '../types'

export const MUNICIPIOS: Municipio[] = [
  {
    id: 'm1', nombre: 'San José del Valle', departamento: 'Antioquia', codigoDane: '05901', activo: true,
    impuestos: { ica: true, reteica: false, autorretencion: false },
    rit: true,
    validarContraRit: { ica: true, reteica: true, autorretencion: true },
    aprobacionPrevia: { ica: false, reteica: false, autorretencion: false },
    cargaAsobancaria: true,
    pagoEfectivo: { ica: true, reteica: false, autorretencion: false },
    pagoCheque: { ica: true, reteica: false, autorretencion: false },
  },
  {
    id: 'm2', nombre: 'Puerto Esperanza', departamento: 'Bolívar', codigoDane: '13901', activo: true,
    impuestos: { ica: true, reteica: true, autorretencion: false },
    rit: true,
    validarContraRit: { ica: true, reteica: true, autorretencion: true },
    aprobacionPrevia: { ica: true, reteica: false, autorretencion: false },
    cargaAsobancaria: false,
    pagoEfectivo: { ica: true, reteica: true, autorretencion: false },
    pagoCheque: { ica: false, reteica: false, autorretencion: false },
  },
  {
    id: 'm3', nombre: 'Santa Rosa de los Andes', departamento: 'Santander', codigoDane: '68901', activo: true,
    impuestos: { ica: true, reteica: true, autorretencion: true },
    rit: true,
    validarContraRit: { ica: true, reteica: true, autorretencion: true },
    aprobacionPrevia: { ica: false, reteica: false, autorretencion: false },
    cargaAsobancaria: true,
    pagoEfectivo: { ica: true, reteica: true, autorretencion: false },
    pagoCheque: { ica: false, reteica: true, autorretencion: false },
  },
]

export const USUARIOS: Usuario[] = [
  { id: 'u1', nombres: 'Laura', apellidos: 'Méndez', cargo: 'Líder de implementación', correo: 'laura.mendez@1cero1.demo', rol: '1cero1', municipioId: null, activo: true },
  { id: 'u2', nombres: 'Carlos', apellidos: 'Restrepo', cargo: 'Secretario de Hacienda', correo: 'c.restrepo@sanjosedelvalle.demo', rol: 'admin_municipio', municipioId: 'm1', activo: true },
  { id: 'u3', nombres: 'Diana', apellidos: 'Gómez', cargo: 'Profesional de Rentas', correo: 'd.gomez@sanjosedelvalle.demo', rol: 'funcionario', municipioId: 'm1', activo: true },
  { id: 'u4', nombres: 'Julián', apellidos: 'Ortiz', cargo: 'Auxiliar de Impuestos', correo: 'j.ortiz@sanjosedelvalle.demo', rol: 'funcionario', municipioId: 'm1', activo: true },
  { id: 'u5', nombres: 'Marcela', apellidos: 'Díaz', cargo: 'Secretaria de Tesorería', correo: 'm.diaz@puertoesperanza.demo', rol: 'admin_municipio', municipioId: 'm2', activo: true },
  { id: 'u6', nombres: 'Andrés', apellidos: 'Barrios', cargo: 'Profesional de Fiscalización', correo: 'a.barrios@puertoesperanza.demo', rol: 'funcionario', municipioId: 'm2', activo: true },
  { id: 'u7', nombres: 'Jorge', apellidos: 'Pardo', cargo: 'Secretario de Hacienda', correo: 'j.pardo@santarosa.demo', rol: 'admin_municipio', municipioId: 'm3', activo: true },
  { id: 'u8', nombres: 'Sandra', apellidos: 'Vega', cargo: 'Técnica de Rentas', correo: 's.vega@santarosa.demo', rol: 'funcionario', municipioId: 'm3', activo: true },
]

export const ACTIVIDADES: { ciiu: string; descripcion: string; sector: Sector }[] = [
  { ciiu: '1011', descripcion: 'Procesamiento y conservación de carne', sector: 'industrial' },
  { ciiu: '1081', descripcion: 'Elaboración de productos de panadería', sector: 'industrial' },
  { ciiu: '2511', descripcion: 'Fabricación de productos metálicos estructurales', sector: 'industrial' },
  { ciiu: '4530', descripcion: 'Comercio de partes y accesorios para vehículos', sector: 'comercial' },
  { ciiu: '4711', descripcion: 'Comercio al por menor en supermercados', sector: 'comercial' },
  { ciiu: '4731', descripcion: 'Comercio al por menor de combustible', sector: 'comercial' },
  { ciiu: '4771', descripcion: 'Comercio al por menor de prendas de vestir', sector: 'comercial' },
  { ciiu: '4111', descripcion: 'Construcción de edificios residenciales', sector: 'servicios' },
  { ciiu: '4923', descripcion: 'Transporte de carga por carretera', sector: 'servicios' },
  { ciiu: '5611', descripcion: 'Expendio a la mesa de comidas preparadas', sector: 'servicios' },
  { ciiu: '6201', descripcion: 'Desarrollo de sistemas informáticos', sector: 'servicios' },
  { ciiu: '6910', descripcion: 'Actividades jurídicas', sector: 'servicios' },
  { ciiu: '8621', descripcion: 'Práctica médica sin internación', sector: 'servicios' },
  { ciiu: '6412', descripcion: 'Bancos comerciales', sector: 'financiero' },
]

/** Tarifas por mil de cada municipio: [industrial, comercial, servicios, financiero]. */
const BASE_TARIFAS: Record<string, [number, number, number, number]> = {
  m1: [7, 10, 10, 5],
  m2: [5, 8, 9, 5],
  m3: [4, 6, 8, 5],
}

/** Actividad que los municipios agregaron en 2026. */
const NUEVAS_2026: typeof ACTIVIDADES = [{ ciiu: '4791', descripcion: 'Comercio al por menor realizado a través de internet', sector: 'comercial' }]

function tarifas(municipioId: string, vigencia: number): Tarifa[] {
  const [ind, com, ser, fin] = BASE_TARIFAS[municipioId]
  // En 2024 la tarifa comercial era un punto más baja.
  const porSector: Record<Sector, number> = { industrial: ind, comercial: vigencia === 2024 ? com - 1 : com, servicios: ser, financiero: fin }
  const actividades = vigencia >= 2026 ? [...ACTIVIDADES, ...NUEVAS_2026] : ACTIVIDADES
  return actividades.map((a) => ({ ...a, porMil: porSector[a.sector] }))
}

/** Actividades de cada municipio por año gravable, como si las hubiera cargado el administrador a inicio de año. */
export const ACTIVIDADES_POR_VIGENCIA: ActividadesVigencia[] = MUNICIPIOS.flatMap((m) => {
  const administrador = USUARIOS.find((u) => u.municipioId === m.id && u.rol === 'admin_municipio')!
  return [2024, 2025, 2026].map((vigencia) => ({
    municipioId: m.id,
    vigencia,
    tarifas: tarifas(m.id, vigencia),
    cargadoPor: nombreCompleto(administrador),
    fechaCarga: `${vigencia}-01-20`,
    archivo: `actividades_${vigencia}.xlsx`,
  }))
})

export const CONFIGURACIONES: ConfigMunicipio[] = [
  {
    municipioId: 'm1',
    periodicidadRetencion: 'bimestral',
    formularioConjunto: false,
    declaracionEnCeros: false,
    cancelacionRitAutomatica: false,
    ocultarRecaudoAFuncionarios: true,
    correccionABaja: 'proyecto_589',
    // El caso típico: tres tramos que bajan a medida que se acerca el vencimiento.
    prontoPago: {
      activo: true,
      porVigencia: [
        {
          vigencia: 2025,
          tramos: [
            { desde: '2026-01-01', hasta: '2026-02-28', porcentaje: 15 },
            { desde: '2026-03-01', hasta: '2026-03-31', porcentaje: 10 },
            { desde: '2026-04-01', hasta: '2026-04-15', porcentaje: 5 },
          ],
        },
        {
          vigencia: 2026,
          tramos: [
            { desde: '2027-01-01', hasta: '2027-02-28', porcentaje: 15 },
            { desde: '2027-03-01', hasta: '2027-03-31', porcentaje: 10 },
            { desde: '2027-04-01', hasta: '2027-04-15', porcentaje: 5 },
          ],
        },
      ],
    },
    calendarioTributario: {
      porVigencia: [
        {
          vigencia: 2025,
          decreto: 'Decreto 0920 de 2025',
          vencimientoIca: '2026-04-17',
          vencimientosReteica: [
            { periodo: 1, fecha: '2025-03-21' },
            { periodo: 2, fecha: '2025-05-20' },
            { periodo: 3, fecha: '2025-07-18' },
            { periodo: 4, fecha: '2025-09-19' },
            { periodo: 5, fecha: '2025-11-21' },
            { periodo: 6, fecha: '2026-01-20' },
          ],
        },
        {
          vigencia: 2026,
          decreto: 'Decreto 0045 de 2026',
          vencimientoIca: '2027-04-16',
          vencimientosReteica: [
            { periodo: 1, fecha: '2026-03-18' },
            { periodo: 2, fecha: '2026-05-20' },
            { periodo: 3, fecha: '2026-07-17' },
            { periodo: 4, fecha: '2026-09-18' },
            { periodo: 5, fecha: '2026-11-20' },
            { periodo: 6, fecha: '2027-01-19' },
          ],
        },
      ],
    },
    anticipoPorcentaje: 40,
    sobretasaBomberil: { activa: true, porcentaje: 4 },
    reteica: { modalidad: 'unica', tarifaUnicaPorMil: 2, baseMinimaServiciosUvt: 15, baseMinimaComprasUvt: 15 },
    autorretencion: { modalidad: 'porcentaje', porcentaje: 50 },
    sanciones: { ...SANCIONES_LEY },
    plazoInscripcionMeses: 2,
    aprobacionPrevia: { plazoDiasHabiles: 5, alVencer: 'aprobar', vigenciaReciboDiasHabiles: 5 },
    formulariosDesactivados: {},
    chequeParcial: false,
  },
  {
    municipioId: 'm2',
    periodicidadRetencion: 'bimestral',
    formularioConjunto: true,
    declaracionEnCeros: true,
    cancelacionRitAutomatica: false,
    ocultarRecaudoAFuncionarios: true,
    correccionABaja: 'correccion_directa',
    prontoPago: {
      activo: true,
      porVigencia: [
        { vigencia: 2024, tramos: [{ desde: '2025-01-01', hasta: '2025-03-14', porcentaje: 15 }] },
        {
          vigencia: 2025,
          tramos: [
            { desde: '2026-01-01', hasta: '2026-02-27', porcentaje: 15 },
            { desde: '2026-02-28', hasta: '2026-03-13', porcentaje: 10 },
          ],
        },
      ],
    },
    calendarioTributario: {
      porVigencia: [
        {
          vigencia: 2024,
          decreto: 'Resolución 011 de 2024',
          vencimientoIca: '2025-03-31',
          vencimientosReteica: [
            { periodo: 1, fecha: '2024-03-19' },
            { periodo: 2, fecha: '2024-05-21' },
            { periodo: 3, fecha: '2024-07-18' },
            { periodo: 4, fecha: '2024-09-19' },
            { periodo: 5, fecha: '2024-11-21' },
            { periodo: 6, fecha: '2025-01-20' },
          ],
        },
        {
          vigencia: 2025,
          decreto: 'Resolución 014 de 2025',
          vencimientoIca: '2026-03-31',
          vencimientosReteica: [
            { periodo: 1, fecha: '2025-03-18' },
            { periodo: 2, fecha: '2025-05-20' },
            { periodo: 3, fecha: '2025-07-17' },
            { periodo: 4, fecha: '2025-09-18' },
            { periodo: 5, fecha: '2025-11-20' },
            { periodo: 6, fecha: '2026-01-19' },
          ],
        },
        {
          vigencia: 2026,
          decreto: 'Resolución 008 de 2026',
          vencimientoIca: '2027-03-31',
          vencimientosReteica: [
            { periodo: 1, fecha: '2026-03-18' },
            { periodo: 2, fecha: '2026-05-20' },
            { periodo: 3, fecha: '2026-07-17' },
            { periodo: 4, fecha: '2026-09-18' },
            { periodo: 5, fecha: '2026-11-20' },
            { periodo: 6, fecha: '2027-01-19' },
          ],
        },
      ],
    },
    anticipoPorcentaje: 25,
    sobretasaBomberil: { activa: true, porcentaje: 5 },
    reteica: { modalidad: 'actividad', tarifaUnicaPorMil: 0, baseMinimaServiciosUvt: 4, baseMinimaComprasUvt: 27 },
    autorretencion: { modalidad: 'plena', porcentaje: 100 },
    sanciones: { ...SANCIONES_LEY },
    plazoInscripcionMeses: 2,
    aprobacionPrevia: { plazoDiasHabiles: 5, alVencer: 'aprobar', vigenciaReciboDiasHabiles: 5 },
    formulariosDesactivados: {},
    chequeParcial: false,
  },
  {
    municipioId: 'm3',
    periodicidadRetencion: 'bimestral',
    formularioConjunto: false,
    declaracionEnCeros: false,
    cancelacionRitAutomatica: true,
    ocultarRecaudoAFuncionarios: true,
    correccionABaja: 'proyecto_589',
    prontoPago: { activo: false, porVigencia: [] },
    calendarioTributario: {
      porVigencia: [
        {
          vigencia: 2025,
          decreto: 'Decreto 028 de 2025',
          vencimientoIca: '2026-04-30',
          vencimientosReteica: [
            { periodo: 1, fecha: '2025-03-20' },
            { periodo: 2, fecha: '2025-05-20' },
            { periodo: 3, fecha: '2025-07-18' },
            { periodo: 4, fecha: '2025-09-18' },
            { periodo: 5, fecha: '2025-11-20' },
            { periodo: 6, fecha: '2026-01-20' },
          ],
        },
        {
          vigencia: 2026,
          decreto: 'Decreto 015 de 2026',
          vencimientoIca: '2027-04-30',
          vencimientosReteica: [
            { periodo: 1, fecha: '2026-03-18' },
            { periodo: 2, fecha: '2026-05-20' },
            { periodo: 3, fecha: '2026-07-17' },
            { periodo: 4, fecha: '2026-09-18' },
            { periodo: 5, fecha: '2026-11-20' },
            { periodo: 6, fecha: '2027-01-19' },
          ],
        },
      ],
    },
    anticipoPorcentaje: 0,
    sobretasaBomberil: { activa: false, porcentaje: 0 },
    reteica: { modalidad: 'concepto', tarifaUnicaPorMil: 0, baseMinimaServiciosUvt: 25, baseMinimaComprasUvt: 50 },
    autorretencion: { modalidad: 'porcentaje', porcentaje: 60 },
    // Ejemplo de municipio que rebajó las sanciones de ley.
    sanciones: { extemporaneidad: 4, extemporaneidadEmplazamiento: 8, correccion: 8, correccionEmplazamiento: 16, minimaUvt: 10 },
    plazoInscripcionMeses: 3,
    aprobacionPrevia: { plazoDiasHabiles: 5, alVencer: 'aprobar', vigenciaReciboDiasHabiles: 5 },
    formulariosDesactivados: {
      autorretencion: { motivo: 'El concejo está tramitando el nuevo porcentaje de autorretención; se reactiva cuando se sancione el acuerdo.', fecha: '2026-10-14', por: 'Jorge Pardo' },
    },
    chequeParcial: false,
  },
]

/** Vencimiento del ICA anual del año gravable 2025, por municipio. */
export const VENCIMIENTO_ICA_2025: Record<string, string> = {
  m1: '2026-04-17',
  m2: '2026-03-31',
  m3: '2026-04-30',
}

/** Vencimientos de retención y autorretención 2026 por bimestre. */
export const VENCIMIENTOS_BIMESTRE_2026 = ['2026-03-18', '2026-05-20', '2026-07-17', '2026-09-18']

export const NOMBRES = ['Ana', 'Luis', 'María', 'Jorge', 'Camila', 'Andrés', 'Paula', 'Felipe', 'Natalia', 'Santiago', 'Valentina', 'Mateo', 'Carolina', 'Sebastián', 'Daniela', 'Alejandro']
export const APELLIDOS = ['García', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'Gómez', 'Zapata', 'Ramírez', 'Torres', 'Castaño', 'Vargas', 'Rojas', 'Cárdenas', 'Mejía', 'Ospina', 'Arango']
export const EMPRESAS = ['Inversiones', 'Comercializadora', 'Distribuidora', 'Constructora', 'Transportes', 'Industrias', 'Servicios Integrales', 'Soluciones', 'Agroindustrial', 'Logística']
export const MARCAS = ['del Valle', 'Andina', 'El Progreso', 'Horizonte', 'La Esperanza', 'Prisma', 'Cóndor', 'Alianza', 'Santa Fe', 'Nogal', 'Monteverde', 'Atlas']
export const CALLES = ['Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal']
