// Datos fijos del mock. Municipios, personas y empresas son ficticios.
import { SANCIONES_LEY } from '../lib/reglas'
import type { ConfigMunicipio, Municipio, Sector, Tarifa, Usuario } from '../types'

export const MUNICIPIOS: Municipio[] = [
  {
    id: 'm1', nombre: 'San José del Valle', departamento: 'Antioquia', codigoDane: '05901', activo: true,
    impuestos: { ica: true, reteica: false, autorretencion: false },
    rit: true,
    validarContraRit: { ica: true, reteica: true, autorretencion: true },
  },
  {
    id: 'm2', nombre: 'Puerto Esperanza', departamento: 'Bolívar', codigoDane: '13901', activo: true,
    impuestos: { ica: true, reteica: true, autorretencion: false },
    rit: true,
    validarContraRit: { ica: true, reteica: true, autorretencion: true },
  },
  {
    id: 'm3', nombre: 'Santa Rosa de los Andes', departamento: 'Santander', codigoDane: '68901', activo: true,
    impuestos: { ica: true, reteica: true, autorretencion: true },
    rit: true,
    validarContraRit: { ica: true, reteica: true, autorretencion: true },
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

function tarifas(municipioId: string): Tarifa[] {
  const [ind, com, ser, fin] = BASE_TARIFAS[municipioId]
  const porSector: Record<Sector, number> = { industrial: ind, comercial: com, servicios: ser, financiero: fin }
  return ACTIVIDADES.map((a) => ({ ...a, porMil: porSector[a.sector] }))
}

export const CONFIGURACIONES: ConfigMunicipio[] = [
  {
    municipioId: 'm1',
    periodicidadRetencion: 'bimestral',
    formularioConjunto: false,
    declaracionEnCeros: false,
    cancelacionRitAutomatica: false,
    correccionABaja: 'proyecto_589',
    prontoPago: { activo: true, porcentaje: 10 },
    anticipoPorcentaje: 40,
    sobretasaBomberil: { activa: true, porcentaje: 4 },
    reteica: { modalidad: 'unica', tarifaUnicaPorMil: 2, baseMinimaServiciosUvt: 15, baseMinimaComprasUvt: 15 },
    autorretencion: { modalidad: 'porcentaje', porcentaje: 50 },
    sanciones: { ...SANCIONES_LEY },
    plazoInscripcionMeses: 2,
    tarifas: tarifas('m1'),
  },
  {
    municipioId: 'm2',
    periodicidadRetencion: 'bimestral',
    formularioConjunto: true,
    declaracionEnCeros: true,
    cancelacionRitAutomatica: false,
    correccionABaja: 'correccion_directa',
    prontoPago: { activo: true, porcentaje: 15 },
    anticipoPorcentaje: 25,
    sobretasaBomberil: { activa: true, porcentaje: 5 },
    reteica: { modalidad: 'actividad', tarifaUnicaPorMil: 0, baseMinimaServiciosUvt: 4, baseMinimaComprasUvt: 27 },
    autorretencion: { modalidad: 'plena', porcentaje: 100 },
    sanciones: { ...SANCIONES_LEY },
    plazoInscripcionMeses: 2,
    tarifas: tarifas('m2'),
  },
  {
    municipioId: 'm3',
    periodicidadRetencion: 'bimestral',
    formularioConjunto: false,
    declaracionEnCeros: false,
    cancelacionRitAutomatica: true,
    correccionABaja: 'proyecto_589',
    prontoPago: { activo: false, porcentaje: 0 },
    anticipoPorcentaje: 0,
    sobretasaBomberil: { activa: false, porcentaje: 0 },
    reteica: { modalidad: 'concepto', tarifaUnicaPorMil: 0, baseMinimaServiciosUvt: 25, baseMinimaComprasUvt: 50 },
    autorretencion: { modalidad: 'porcentaje', porcentaje: 60 },
    // Ejemplo de municipio que rebajó las sanciones de ley.
    sanciones: { extemporaneidad: 4, extemporaneidadEmplazamiento: 8, correccion: 8, correccionEmplazamiento: 16, minimaUvt: 10 },
    plazoInscripcionMeses: 3,
    tarifas: tarifas('m3'),
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
