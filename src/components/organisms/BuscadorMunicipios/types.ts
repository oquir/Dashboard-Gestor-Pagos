export interface BuscadorMunicipiosProps {
  /** Ofrece ver todos los municipios juntos. No va en las vistas que necesitan uno solo, como la configuración. */
  todos?: boolean
}

/** Lo que se puede elegir en la lista: un municipio o todos (id null). */
export interface OpcionMunicipio {
  id: string | null
  nombre: string
  detalle: string
  inactivo: boolean
}
