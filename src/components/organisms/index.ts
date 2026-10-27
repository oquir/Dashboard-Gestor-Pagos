// Organismos: secciones completas de la interfaz, hechas de moléculas y átomos. Pueden leer y cambiar los datos de la demo.
// Los genéricos van en la raíz; los de cada tema, en su carpeta. Entre organismos se importan por su ruta, no desde este índice.
export { default as BarraSuperior } from './BarraSuperior'
export { default as GraficoBarras } from './GraficoBarras'
export { default as GraficoRecaudo } from './GraficoRecaudo'
export { default as ListaArchivos } from './ListaArchivos'
export { default as Navegacion } from './Navegacion'
export { default as Tabla } from './Tabla'

export { default as CatalogoActividades } from './actividades/CatalogoActividades'

export { default as FormularioConfiguracion } from './configuracion/FormularioConfiguracion'

export { default as AprobacionPrevia } from './declaraciones/AprobacionPrevia'
export { default as DatosDeclaracion } from './declaraciones/DatosDeclaracion'
export { default as Liquidacion } from './declaraciones/Liquidacion'
export { default as PagosDeclaracion } from './declaraciones/PagosDeclaracion'
export { default as SeleccionDeclaraciones } from './declaraciones/SeleccionDeclaraciones'
export { default as TablaDeclaraciones } from './declaraciones/TablaDeclaraciones'
export { default as ValidacionesDeclaracion } from './declaraciones/ValidacionesDeclaracion'

export { default as AprobacionesPendientes } from './inicio/AprobacionesPendientes'
export { default as ListaDeudas } from './inicio/ListaDeudas'
export { default as RecaudoAnual } from './inicio/RecaudoAnual'
export { default as SolicitudesPendientes } from './inicio/SolicitudesPendientes'

export { default as DeclaracionesPresentadas } from './inscripciones/DeclaracionesPresentadas'
export { default as EncabezadoSolicitud } from './inscripciones/EncabezadoSolicitud'
export { default as FichaCancelacion } from './inscripciones/FichaCancelacion'
export { default as FichaRit } from './inscripciones/FichaRit'
export { default as LineaTiempoSolicitudes } from './inscripciones/LineaTiempoSolicitudes'
export { default as RespuestaSolicitud } from './inscripciones/RespuestaSolicitud'
export { default as TablaInscripciones } from './inscripciones/TablaInscripciones'

export { default as TarjetaMunicipio } from './municipios/TarjetaMunicipio'

export { default as CargaAsobancaria } from './pagos/CargaAsobancaria'
export { default as DescargaAsobancaria } from './pagos/DescargaAsobancaria'
export { default as TablaCartera } from './pagos/TablaCartera'
export { default as TablaPagosRecibidos } from './pagos/TablaPagosRecibidos'

export { default as TablaReporte } from './reportes/TablaReporte'

export { default as NuevoUsuario } from './usuarios/NuevoUsuario'
export { default as TablaUsuarios } from './usuarios/TablaUsuarios'
