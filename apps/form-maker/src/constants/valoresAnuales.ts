import type { ValorAnual } from '../types'

// UVT (resolucion DIAN) y SMMLV (decreto) publicados, del mas nuevo al mas viejo. Son datos de
// prueba: el aplicativo real los pide a su endpoint. 2026 verificado (Res. 000238 de 2025);
// contrastar los anteriores antes de usarlos.
export const VALORES_POR_DEFECTO: ValorAnual[] = [
  { anio: 2026, uvt: 52374, smmlv: 1750905 },
  { anio: 2025, uvt: 49799, smmlv: 1423500 },
  { anio: 2024, uvt: 47065, smmlv: 1300000 },
  { anio: 2023, uvt: 42412, smmlv: 1160000 },
  { anio: 2022, uvt: 38004, smmlv: 1000000 },
  { anio: 2021, uvt: 36308, smmlv: 908526 },
  { anio: 2020, uvt: 35607, smmlv: 877803 },
]
