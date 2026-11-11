export interface MunicipalitySearchProps {
  /** Ofrece ver todos los municipios juntos. No va en las vistas que necesitan uno solo, como la configuración. */
  all?: boolean
}

/** Lo que se puede elegir en la lista: un municipio o todos (id null). */
export interface MunicipalityOption {
  id: string | null
  name: string
  detail: string
  inactive: boolean
}
