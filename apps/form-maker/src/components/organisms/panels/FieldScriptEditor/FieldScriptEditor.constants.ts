export { ERROR_CLASSES, HINT_CLASSES, WARNING_CLASSES } from '../../../../constants/uiClasses'

export const READS_CLASSES: string =
  'rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-fg-muted'

export const SCRIPT_PLACEHOLDER: string =
  'return {{total_ingresos_nacionales}} - {{ingresos_fuera_municipio}};'

// uvt() sin tabla devuelve null y no 0: un 0 borraria en silencio pisos y topes escritos en UVT.
export const SCRIPT_DESCRIPTION: string =
  'Calcula el valor del campo con JavaScript y se vuelve a correr cada vez que cambia algo que lee. Devolvé el resultado con return: reemplaza lo que haya escrito el usuario, y return undefined lo deja como está. {{campo}} lee otro campo (escribí {{ o usá Ctrl+Espacio). También tenés value, index y funciones como sum, max o round. fechaLimite, diasDeMora y mesesDeMora salen de la pestaña Fechas; uvt y smmlv, de Catálogos. Sin datos cargados devuelven null o 0, así que dejá un respaldo: uvt() ?? 52374.'

export const SIMPLE_CALC_DESCRIPTION: string =
  'Si no programás, usá Editar sin código: armás el cálculo eligiendo campos que se suman o se restan, y el script se escribe solo.'
