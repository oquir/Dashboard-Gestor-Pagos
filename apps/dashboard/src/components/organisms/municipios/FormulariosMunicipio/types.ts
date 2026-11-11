import type { Municipio, PausasMunicipio } from '../../../../types'

export interface FormulariosMunicipioProps {
  municipio: Municipio
  pausas: PausasMunicipio
}

/** Lo que se activa por formulario, además de gestionarlo. */
export type OpcionFormulario = 'validarContraRit' | 'aprobacionPrevia' | 'pagoEfectivo' | 'pagoCheque'

export interface GrupoOpciones {
  titulo: string
  opciones: { clave: OpcionFormulario; texto: string }[]
}
