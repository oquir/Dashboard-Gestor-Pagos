import type { RegistroBitacora } from '../../../../types'

export interface RecorridoBitacoraProps {
  /** El de número inmediatamente menor y el de número inmediatamente mayor; sin él, el botón se desactiva. */
  anterior?: RegistroBitacora
  siguiente?: RegistroBitacora
  /** Qué se recorre: "San José del Valle" o "todos los municipios". */
  ambito: string
}
