// Datos fijos del mock. Municipios, personas y empresas son ficticios.
import { DIGITS } from '../constants'
import { fullName } from '../lib/format'
import { STATUTORY_PENALTIES } from '../lib/rules'
import type {
  FiscalYearActivities,
  MunicipalityConfig,
  Municipality,
  Frequency,
  Sector,
  Rate,
  User,
  FormDueDates,
} from '../types'

/** Los formularios activos de la demo salieron a producción el mismo día; los que nunca se han activado no tienen fecha. */
const PRODUCTION = '2026-02-01'

export const MUNICIPALITIES: Municipality[] = [
  {
    id: 'm1',
    name: 'Villeta',
    department: 'Cundinamarca',
    daneCode: '25875',
    isActive: true,
    inProductionSince: { rit: PRODUCTION, ica: PRODUCTION },
    taxes: { ica: true, reteica: false, selfWithholding: false },
    rit: true,
    validateAgainstRit: { ica: true, reteica: true, selfWithholding: true },
    priorApproval: { ica: false, reteica: false, selfWithholding: false },
    asobancariaUpload: true,
    cashPayment: { ica: true, reteica: false, selfWithholding: false },
    checkPayment: { ica: true, reteica: false, selfWithholding: false },
  },
  {
    id: 'm2',
    name: 'Ricaurte',
    department: 'Cundinamarca',
    daneCode: '25612',
    isActive: true,
    inProductionSince: { rit: PRODUCTION, ica: PRODUCTION, reteica: PRODUCTION },
    taxes: { ica: true, reteica: true, selfWithholding: false },
    rit: true,
    // La ReteICA no se valida contra el RIT: también la declaran agentes que no se han inscrito.
    validateAgainstRit: { ica: true, reteica: false, selfWithholding: true },
    priorApproval: { ica: true, reteica: false, selfWithholding: false },
    asobancariaUpload: false,
    cashPayment: { ica: true, reteica: true, selfWithholding: false },
    checkPayment: { ica: false, reteica: false, selfWithholding: false },
  },
  {
    id: 'm3',
    name: 'Garzón',
    department: 'Huila',
    daneCode: '41298',
    isActive: true,
    inProductionSince: { ica: PRODUCTION, reteica: PRODUCTION, selfWithholding: PRODUCTION },
    taxes: { ica: true, reteica: true, selfWithholding: true },
    // No lleva el RIT en ningún sistema: de sus contribuyentes solo se sabe lo que escriben en las declaraciones.
    rit: false,
    validateAgainstRit: { ica: false, reteica: false, selfWithholding: false },
    priorApproval: { ica: false, reteica: false, selfWithholding: false },
    asobancariaUpload: true,
    cashPayment: { ica: true, reteica: true, selfWithholding: false },
    checkPayment: { ica: false, reteica: true, selfWithholding: false },
  },
]

export const USERS: User[] = [
  {
    id: 'u1',
    firstNames: 'Laura',
    lastNames: 'Méndez',
    jobTitle: 'Líder de implementación',
    email: 'laura.mendez@1cero1.demo',
    role: '1cero1',
    municipalityId: null,
    isActive: true,
  },
  {
    id: 'u2',
    firstNames: 'Carlos',
    lastNames: 'Restrepo',
    jobTitle: 'Secretario de Hacienda',
    email: 'c.restrepo@villeta.demo',
    role: 'municipality_admin',
    municipalityId: 'm1',
    isActive: true,
  },
  {
    id: 'u3',
    firstNames: 'Diana',
    lastNames: 'Gómez',
    jobTitle: 'Profesional de Rentas',
    email: 'd.gomez@villeta.demo',
    role: 'official',
    municipalityId: 'm1',
    isActive: true,
  },
  {
    id: 'u4',
    firstNames: 'Julián',
    lastNames: 'Ortiz',
    jobTitle: 'Auxiliar de Impuestos',
    email: 'j.ortiz@villeta.demo',
    role: 'official',
    municipalityId: 'm1',
    isActive: true,
  },
  {
    id: 'u5',
    firstNames: 'Marcela',
    lastNames: 'Díaz',
    jobTitle: 'Secretaria de Tesorería',
    email: 'm.diaz@ricaurte.demo',
    role: 'municipality_admin',
    municipalityId: 'm2',
    isActive: true,
  },
  {
    id: 'u6',
    firstNames: 'Andrés',
    lastNames: 'Barrios',
    jobTitle: 'Profesional de Fiscalización',
    email: 'a.barrios@ricaurte.demo',
    role: 'official',
    municipalityId: 'm2',
    isActive: true,
  },
  {
    id: 'u7',
    firstNames: 'Jorge',
    lastNames: 'Pardo',
    jobTitle: 'Secretario de Hacienda',
    email: 'j.pardo@garzon.demo',
    role: 'municipality_admin',
    municipalityId: 'm3',
    isActive: true,
  },
  {
    id: 'u8',
    firstNames: 'Sandra',
    lastNames: 'Vega',
    jobTitle: 'Técnica de Rentas',
    email: 's.vega@garzon.demo',
    role: 'official',
    municipalityId: 'm3',
    isActive: true,
  },
]

export const ACTIVITIES: { ciiu: string; description: string; sector: Sector }[] = [
  { ciiu: '1011', description: 'Procesamiento y conservación de carne', sector: 'industrial' },
  { ciiu: '1081', description: 'Elaboración de productos de panadería', sector: 'industrial' },
  {
    ciiu: '2511',
    description: 'Fabricación de productos metálicos estructurales',
    sector: 'industrial',
  },
  {
    ciiu: '4530',
    description: 'Comercio de partes y accesorios para vehículos',
    sector: 'commercial',
  },
  { ciiu: '4711', description: 'Comercio al por menor en supermercados', sector: 'commercial' },
  { ciiu: '4731', description: 'Comercio al por menor de combustible', sector: 'commercial' },
  { ciiu: '4771', description: 'Comercio al por menor de prendas de vestir', sector: 'commercial' },
  { ciiu: '4111', description: 'Construcción de edificios residenciales', sector: 'services' },
  { ciiu: '4923', description: 'Transporte de carga por carretera', sector: 'services' },
  { ciiu: '5611', description: 'Expendio a la mesa de comidas preparadas', sector: 'services' },
  { ciiu: '6201', description: 'Desarrollo de sistemas informáticos', sector: 'services' },
  { ciiu: '6910', description: 'Actividades jurídicas', sector: 'services' },
  { ciiu: '8621', description: 'Práctica médica sin internación', sector: 'services' },
  { ciiu: '6412', description: 'Bancos comerciales', sector: 'financial' },
]

/** Tarifas por mil de cada municipio: [industrial, comercial, servicios, financiero]. */
const RATES_BASE: Record<string, [number, number, number, number]> = {
  m1: [7, 10, 10, 5],
  m2: [5, 8, 9, 5],
  m3: [4, 6, 8, 5],
}

/** Actividad que los municipios agregaron en 2026. */
const NEW_2026: typeof ACTIVITIES = [
  {
    ciiu: '4791',
    description: 'Comercio al por menor realizado a través de internet',
    sector: 'commercial',
  },
]

function rates(municipalityId: string, fiscalYear: number): Rate[] {
  const [ind, com, ser, end] = RATES_BASE[municipalityId]
  // En 2024 la tarifa comercial era un punto más baja.
  const bySector: Record<Sector, number> = {
    industrial: ind,
    commercial: fiscalYear === 2024 ? com - 1 : com,
    services: ser,
    financial: end,
  }
  const activities = fiscalYear >= 2026 ? [...ACTIVITIES, ...NEW_2026] : ACTIVITIES
  return activities.map((a) => ({ ...a, perThousand: bySector[a.sector] }))
}

/** Actividades de cada municipio por año gravable, como si las hubiera cargado el administrador a inicio de año. */
export const ACTIVITIES_BY_FISCAL_YEAR: FiscalYearActivities[] = MUNICIPALITIES.flatMap((m) => {
  const admin = USERS.find((u) => u.municipalityId === m.id && u.role === 'municipality_admin')!
  return [2024, 2025, 2026].map((fiscalYear) => ({
    municipalityId: m.id,
    fiscalYear,
    rates: rates(m.id, fiscalYear),
    uploadedBy: fullName(admin),
    uploadDate: `${fiscalYear}-01-20`,
    file: `actividades_${fiscalYear}.xlsx`,
  }))
})

/** El administrador del municipio cargó el calendario del año gravable en esa fecha. */
const uploadedByAdmin = (municipalityId: string, date: string) => ({
  date,
  por: fullName(
    USERS.find((u) => u.municipalityId === municipalityId && u.role === 'municipality_admin')!,
  ),
})

/** Vencimientos con una fecha por periodo, la misma para todos los declarantes. */
const uniqueDates = (frequency: Frequency, dates: string[]): FormDueDates => ({
  frequency,
  byDigit: false,
  periods: dates.map((date, i) => ({ period: i + 1, dates: [date] })),
})

/** Vencimientos por último dígito: cada periodo lista sus fechas del dígito 1 al 0, como los calendarios. */
const datesByDigit = (frequency: Frequency, byPeriod: string[][]): FormDueDates => ({
  frequency,
  byDigit: true,
  periods: byPeriod.map((list, i) => ({
    period: i + 1,
    dates: Array.from({ length: 10 }, (_, d) => list[DIGITS.indexOf(d)]),
  })),
})

export const SETTINGS: MunicipalityConfig[] = [
  {
    municipalityId: 'm1',
    zeroDeclaration: false,
    withholdingPaymentInTwoMonths: true,
    automaticRitCancellation: false,
    hideCollectionFromOfficials: true,
    downwardCorrection: 'project_589',
    // El caso típico: tres tramos que bajan a medida que se acerca el vencimiento.
    earlyPayment: {
      isActive: true,
      byFiscalYear: [
        {
          fiscalYear: 2025,
          tiers: [
            { from: '2026-01-01', to: '2026-02-28', percentage: 15 },
            { from: '2026-03-01', to: '2026-03-31', percentage: 10 },
            { from: '2026-04-01', to: '2026-04-15', percentage: 5 },
          ],
        },
        {
          fiscalYear: 2026,
          tiers: [
            { from: '2027-01-01', to: '2027-02-28', percentage: 15 },
            { from: '2027-03-01', to: '2027-03-31', percentage: 10 },
            { from: '2027-04-01', to: '2027-04-15', percentage: 5 },
          ],
        },
      ],
    },
    taxCalendar: {
      byFiscalYear: [
        {
          fiscalYear: 2025,
          decree: 'Decreto 0920 de 2025',
          uploaded: uploadedByAdmin('m1', '2025-01-14'),
          ica: uniqueDates('annual', ['2026-04-17']),
          reteica: uniqueDates('bimonthly', [
            '2025-03-21',
            '2025-05-20',
            '2025-07-18',
            '2025-09-19',
            '2025-11-21',
            '2026-01-20',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2025-03-21',
            '2025-05-20',
            '2025-07-18',
            '2025-09-19',
            '2025-11-21',
            '2026-01-20',
          ]),
        },
        {
          fiscalYear: 2026,
          decree: 'Decreto 0045 de 2026',
          uploaded: uploadedByAdmin('m1', '2026-01-23'),
          ica: uniqueDates('annual', ['2027-04-16']),
          reteica: uniqueDates('bimonthly', [
            '2026-03-18',
            '2026-05-20',
            '2026-07-17',
            '2026-09-18',
            '2026-11-20',
            '2027-01-19',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2026-03-18',
            '2026-05-20',
            '2026-07-17',
            '2026-09-18',
            '2026-11-20',
            '2027-01-19',
          ]),
        },
      ],
    },
    advancePercentage: 40,
    fireSurcharge: { active: true, percentage: 4 },
    reteica: {
      modality: 'flat',
      flatRatePerThousand: 2,
      minServiceBaseUvt: 15,
      minPurchaseBaseUvt: 15,
    },
    selfWithholding: { modality: 'percentage', percentage: 50 },
    penalties: { ...STATUTORY_PENALTIES },
    registrationTermMonths: 2,
    priorApproval: { termBusinessDays: 5, onDue: 'approve', receiptValidityBusinessDays: 5 },
    disabledForms: {},
    partialCheck: false,
  },
  {
    municipalityId: 'm2',
    zeroDeclaration: true,
    withholdingPaymentInTwoMonths: true,
    automaticRitCancellation: false,
    hideCollectionFromOfficials: true,
    downwardCorrection: 'direct_correction',
    earlyPayment: {
      isActive: true,
      byFiscalYear: [
        { fiscalYear: 2024, tiers: [{ from: '2025-01-01', to: '2025-03-14', percentage: 15 }] },
        {
          fiscalYear: 2025,
          tiers: [
            { from: '2026-01-01', to: '2026-02-27', percentage: 15 },
            { from: '2026-02-28', to: '2026-03-13', percentage: 10 },
          ],
        },
      ],
    },
    taxCalendar: {
      byFiscalYear: [
        {
          fiscalYear: 2024,
          decree: 'Resolución 011 de 2024',
          uploaded: uploadedByAdmin('m2', '2024-01-17'),
          ica: uniqueDates('annual', ['2025-03-31']),
          reteica: uniqueDates('bimonthly', [
            '2024-03-19',
            '2024-05-21',
            '2024-07-18',
            '2024-09-19',
            '2024-11-21',
            '2025-01-20',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2024-03-19',
            '2024-05-21',
            '2024-07-18',
            '2024-09-19',
            '2024-11-21',
            '2025-01-20',
          ]),
        },
        {
          fiscalYear: 2025,
          decree: 'Resolución 014 de 2025',
          uploaded: uploadedByAdmin('m2', '2025-01-22'),
          ica: uniqueDates('annual', ['2026-03-31']),
          reteica: uniqueDates('bimonthly', [
            '2025-03-18',
            '2025-05-20',
            '2025-07-17',
            '2025-09-18',
            '2025-11-20',
            '2026-01-19',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2025-03-18',
            '2025-05-20',
            '2025-07-17',
            '2025-09-18',
            '2025-11-20',
            '2026-01-19',
          ]),
        },
        {
          fiscalYear: 2026,
          decree: 'Resolución 008 de 2026',
          // Lo cargó tarde: las primeras ReteICA del año se presentaron sin él y quedan marcadas.
          uploaded: uploadedByAdmin('m2', '2026-04-08'),
          // Desde este año el ICA anual vence según el último dígito del NIT o la cédula: un día hábil por dígito.
          ica: datesByDigit('annual', [
            [
              '2027-04-05',
              '2027-04-06',
              '2027-04-07',
              '2027-04-08',
              '2027-04-09',
              '2027-04-12',
              '2027-04-13',
              '2027-04-14',
              '2027-04-15',
              '2027-04-16',
            ],
          ]),
          // Desde este año la ReteICA es mensual, como en Ricaurte (Nariño); hasta 2025 era bimestral.
          reteica: uniqueDates('monthly', [
            '2026-02-18',
            '2026-03-18',
            '2026-04-20',
            '2026-05-19',
            '2026-06-18',
            '2026-07-17',
            '2026-08-19',
            '2026-09-18',
            '2026-10-20',
            '2026-11-19',
            '2026-12-18',
            '2027-01-19',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2026-03-18',
            '2026-05-20',
            '2026-07-17',
            '2026-09-18',
            '2026-11-20',
            '2027-01-19',
          ]),
        },
      ],
    },
    advancePercentage: 25,
    fireSurcharge: { active: true, percentage: 5 },
    reteica: {
      modality: 'activity',
      flatRatePerThousand: 0,
      minServiceBaseUvt: 4,
      minPurchaseBaseUvt: 27,
    },
    selfWithholding: { modality: 'full', percentage: 100 },
    penalties: { ...STATUTORY_PENALTIES },
    registrationTermMonths: 2,
    priorApproval: { termBusinessDays: 5, onDue: 'approve', receiptValidityBusinessDays: 5 },
    disabledForms: {},
    partialCheck: false,
  },
  {
    municipalityId: 'm3',
    zeroDeclaration: false,
    withholdingPaymentInTwoMonths: true,
    automaticRitCancellation: false,
    hideCollectionFromOfficials: true,
    downwardCorrection: 'project_589',
    earlyPayment: { isActive: false, byFiscalYear: [] },
    taxCalendar: {
      byFiscalYear: [
        // La AutoReteICA del bimestre 6 vence en diciembre, antes de que termine el año, como en Medellín.
        {
          fiscalYear: 2025,
          decree: 'Decreto 028 de 2025',
          uploaded: uploadedByAdmin('m3', '2025-01-21'),
          ica: uniqueDates('annual', ['2026-04-30']),
          reteica: uniqueDates('bimonthly', [
            '2025-03-20',
            '2025-05-20',
            '2025-07-18',
            '2025-09-18',
            '2025-11-20',
            '2026-01-20',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2025-03-20',
            '2025-05-20',
            '2025-07-18',
            '2025-09-18',
            '2025-11-20',
            '2025-12-19',
          ]),
        },
        {
          fiscalYear: 2026,
          decree: 'Decreto 015 de 2026',
          uploaded: uploadedByAdmin('m3', '2026-01-27'),
          ica: uniqueDates('annual', ['2027-04-30']),
          // Desde este año la ReteICA es trimestral; la AutoReteICA sigue bimestral.
          reteica: uniqueDates('quarterly', [
            '2026-04-20',
            '2026-07-17',
            '2026-10-20',
            '2027-01-19',
          ]),
          selfWithholding: uniqueDates('bimonthly', [
            '2026-03-18',
            '2026-05-20',
            '2026-07-17',
            '2026-09-18',
            '2026-11-20',
            '2026-12-21',
          ]),
        },
      ],
    },
    advancePercentage: 0,
    fireSurcharge: { active: false, percentage: 0 },
    reteica: {
      modality: 'concept',
      flatRatePerThousand: 0,
      minServiceBaseUvt: 25,
      minPurchaseBaseUvt: 50,
    },
    selfWithholding: { modality: 'percentage', percentage: 60 },
    // Ejemplo de municipio que rebajó las sanciones de ley.
    penalties: {
      lateFiling: 4,
      summonsLateFiling: 8,
      correction: 8,
      summonsCorrection: 16,
      minimumUvt: 10,
    },
    registrationTermMonths: 3,
    priorApproval: { termBusinessDays: 5, onDue: 'approve', receiptValidityBusinessDays: 5 },
    disabledForms: {
      selfWithholding: {
        reason:
          'El concejo está tramitando el nuevo porcentaje de autorretención; se reactiva cuando se sancione el acuerdo.',
        date: '2026-10-14',
        por: 'Jorge Pardo',
      },
    },
    partialCheck: false,
  },
]

export const FIRST_NAMES = [
  'Ana',
  'Luis',
  'María',
  'Jorge',
  'Camila',
  'Andrés',
  'Paula',
  'Felipe',
  'Natalia',
  'Santiago',
  'Valentina',
  'Mateo',
  'Carolina',
  'Sebastián',
  'Daniela',
  'Alejandro',
]
export const LAST_NAMES = [
  'García',
  'Rodríguez',
  'Martínez',
  'López',
  'Hernández',
  'Gómez',
  'Zapata',
  'Ramírez',
  'Torres',
  'Castaño',
  'Vargas',
  'Rojas',
  'Cárdenas',
  'Mejía',
  'Ospina',
  'Arango',
]
export const COMPANIES = [
  'Inversiones',
  'Comercializadora',
  'Distribuidora',
  'Constructora',
  'Transportes',
  'Industrias',
  'Servicios Integrales',
  'Soluciones',
  'Agroindustrial',
  'Logística',
]
export const MARKS = [
  'del Valle',
  'Andina',
  'El Progreso',
  'Horizonte',
  'La Esperanza',
  'Prisma',
  'Cóndor',
  'Alianza',
  'Santa Fe',
  'Nogal',
  'Monteverde',
  'Atlas',
]
export const STREETS = ['Calle', 'Carrera', 'Avenida', 'Diagonal', 'Transversal']
