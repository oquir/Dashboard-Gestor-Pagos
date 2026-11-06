// Estado de la demo. Vive en el navegador (localStorage): no hay API.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PETICIONES } from './constants'
import type { Peticion } from './constants'
import { generarDatos } from './data/generar'
import { nombreCompleto } from './lib/formato'
import type { Archivo, Cheque, ConfigMunicipio, Datos, EstadoNovedad, Impuesto, Municipio, RegistroBitacora, Tarifa, Usuario } from './types'
import { ahora, hoy } from './utils'

/** Lo del municipio que se activa por formulario. */
type ModuloPorImpuesto = 'impuestos' | 'validarContraRit' | 'aprobacionPrevia' | 'pagoEfectivo' | 'pagoCheque'

interface Estado extends Datos {
  usuarioId: string | null
  /** Municipio que está mirando el rol 1cero1; null = todos. */
  municipioSeleccionado: string | null
  iniciarSesion: (usuarioId: string) => void
  cerrarSesion: () => void
  seleccionarMunicipio: (id: string | null) => void
  resolverNovedad: (
    inscripcionId: string,
    novedadId: string,
    estado: Exclude<EstadoNovedad, 'pendiente'>,
    observacion: string,
    documentos: Archivo[],
  ) => void
  /** Aprueba o rechaza una declaración con aprobación previa. */
  resolverAprobacion: (id: string, estado: 'aprobada' | 'rechazada', observacion: string) => void
  guardarConfiguracion: (config: ConfigMunicipio) => void
  /** Reemplaza las actividades del año gravable con las del Excel cargado. */
  cargarActividades: (municipioId: string, vigencia: number, tarifas: Tarifa[], archivo: string) => void
  guardarUsuario: (usuario: Usuario) => void
  alternarUsuario: (id: string) => void
  /** Borra el usuario de la demo. Lo que hizo queda con su nombre, que se guarda como texto. */
  eliminarUsuario: (id: string) => void
  alternarMunicipio: (id: string) => void
  /** Fecha desde la que el municipio recibe declaraciones en el aplicativo; desde ahí se revisan los omisos. */
  cambiarDeclaracionesDesde: (municipioId: string, fecha: string) => void
  /** Activa o desactiva un impuesto del municipio; siempre debe quedar al menos uno activo. */
  alternarImpuesto: (municipioId: string, impuesto: Impuesto) => void
  alternarRit: (municipioId: string) => void
  /** Activa o desactiva la validación contra el RIT de un formulario del municipio. */
  alternarValidacionRit: (municipioId: string, impuesto: Impuesto) => void
  /** Activa o desactiva la aprobación previa de un formulario; aplica a lo que se radique desde entonces. */
  alternarAprobacionPrevia: (municipioId: string, impuesto: Impuesto) => void
  /** Habilita o quita la carga del Asobancaria 2001 en el municipio, para todos sus pagos con código de barras. */
  alternarCargaAsobancaria: (municipioId: string) => void
  /** Habilita o quita el pago en efectivo en la ventanilla para un formulario del municipio. */
  alternarPagoEfectivo: (municipioId: string, impuesto: Impuesto) => void
  /** Registra un pago en efectivo recibido hoy en la ventanilla del municipio: el total o parte del saldo. */
  registrarPagoVentanilla: (declaracionId: string, valor: number, recibo: string) => void
  /** Habilita o quita los cheques de gerencia en la ventanilla para un formulario del municipio. */
  alternarPagoCheque: (municipioId: string, impuesto: Impuesto) => void
  /** Recibe hoy un cheque de gerencia en la ventanilla; queda en canje hasta que el banco responda. */
  recibirCheque: (declaracionId: string, cheque: Pick<Cheque, 'valor' | 'banco' | 'numero' | 'recibo'>) => void
  /** El banco pagó el cheque: se vuelve un pago con la fecha en que se recibió. */
  confirmarCheque: (id: string) => void
  /** El banco devolvió el cheque: no hay pago y la declaración vuelve a tener saldo. */
  devolverCheque: (id: string, motivo: string) => void
  reiniciarDemo: () => void
}

export const useDatos = create<Estado>()(
  persist(
    (set, get) => {
      const usuarioActual = () => get().usuarios.find((u) => u.id === get().usuarioId)
      const municipioDeDeclaracion = (declaracionId: string | undefined) => get().declaraciones.find((d) => d.id === declaracionId)?.municipioId ?? null

      /**
       * Lo que hará el back al terminar cada endpoint, salga bien o mal: deja en la bitácora quién hizo la petición,
       * cuándo y con qué datos.
       */
      const registrar = (peticion: Peticion, municipioId: string | null, datos: Record<string, unknown>, exito = true) => {
        const u = usuarioActual()
        if (!u) return
        const registro: RegistroBitacora = {
          id: Math.max(0, ...get().bitacora.map((r) => r.id)) + 1,
          fechaHora: ahora(),
          usuario: { id: u.id, nombre: nombreCompleto(u), rol: u.rol },
          municipioId,
          ...peticion,
          datos,
          exito,
        }
        set((s) => ({ bitacora: [registro, ...s.bitacora] }))
      }

      const cambiarMunicipio = (municipioId: string, cambio: Partial<Municipio>) =>
        set((s) => ({ municipios: s.municipios.map((m) => (m.id === municipioId ? { ...m, ...cambio } : m)) }))

      /** Activa o desactiva un módulo del municipio. La bitácora guarda el valor nuevo, no un "alternar". */
      const alternarModulo = (municipioId: string, modulo: 'activo' | 'rit' | 'cargaAsobancaria') => {
        const m = get().municipios.find((x) => x.id === municipioId)
        if (!m) return
        cambiarMunicipio(municipioId, { [modulo]: !m[modulo] })
        registrar(modulo === 'activo' ? PETICIONES.cambiarEstadoMunicipio : PETICIONES.cambiarModulo, municipioId, { municipioId, [modulo]: !m[modulo] })
      }

      /** Lo mismo, para lo que se activa por formulario. Desactivar el último impuesto activo falla. */
      const alternarModuloPorImpuesto = (municipioId: string, modulo: ModuloPorImpuesto, impuesto: Impuesto) => {
        const m = get().municipios.find((x) => x.id === municipioId)
        if (!m) return
        const valor = !m[modulo][impuesto]
        const nuevo = { ...m[modulo], [impuesto]: valor }
        const exito = modulo !== 'impuestos' || Object.values(nuevo).some(Boolean)
        if (exito) cambiarMunicipio(municipioId, { [modulo]: nuevo })
        registrar(PETICIONES.cambiarModulo, municipioId, { municipioId, [modulo]: { [impuesto]: valor } }, exito)
      }

      return {
        ...generarDatos(),
        usuarioId: null,
        municipioSeleccionado: null,

        iniciarSesion: (usuarioId) => {
          set({ usuarioId, municipioSeleccionado: null })
          const u = usuarioActual()
          if (u) registrar(PETICIONES.iniciarSesion, u.municipioId, { correo: u.correo })
        },
        cerrarSesion: () => set({ usuarioId: null }),
        seleccionarMunicipio: (id) => set({ municipioSeleccionado: id }),

        resolverNovedad: (inscripcionId, novedadId, estado, observacion, documentos) => {
          const usuario = usuarioActual()
          const revisor = usuario && nombreCompleto(usuario)
          set((s) => ({
            inscripciones: s.inscripciones.map((ins) => {
              if (ins.id !== inscripcionId) return ins
              const novedad = ins.novedades.find((n) => n.id === novedadId)
              if (!novedad) return ins
              const novedades = ins.novedades.map((n) =>
                n.id === novedadId
                  ? {
                      ...n,
                      estado,
                      observacion: observacion || undefined,
                      documentosRespuesta: documentos.length > 0 ? documentos : undefined,
                      revisadaPor: revisor,
                      fechaRevision: hoy(),
                    }
                  : n,
              )
              let { estado: estadoInscripcion, calidades } = ins
              if (estado === 'aprobada') {
                if (novedad.tipo === 'inscripcion') estadoInscripcion = 'activa'
                if (novedad.tipo === 'cancelacion') estadoInscripcion = 'cancelada'
                if (novedad.tipo === 'actualizacion' && novedad.calidad) {
                  const acto = /\(([^)]+)\)/.exec(novedad.descripcion)?.[1]
                  calidades = [...calidades, { calidad: novedad.calidad, desde: hoy(), acto }]
                }
              } else if (novedad.tipo === 'inscripcion') {
                estadoInscripcion = 'rechazada'
              }
              return { ...ins, novedades, estado: estadoInscripcion, calidades }
            }),
          }))
          // De los archivos, el back guarda el nombre.
          registrar(PETICIONES.resolverNovedad, get().inscripciones.find((i) => i.id === inscripcionId)?.municipioId ?? null, {
            inscripcionId,
            novedadId,
            estado,
            observacion,
            documentos: documentos.map((d) => d.nombre),
          })
        },

        resolverAprobacion: (id, estado, observacion) => {
          const usuario = usuarioActual()
          const por = usuario ? nombreCompleto(usuario) : ''
          set((s) => ({
            declaraciones: s.declaraciones.map((d) =>
              d.id === id ? { ...d, aprobacion: { estado, fecha: hoy(), por, observacion: observacion || undefined } } : d,
            ),
          }))
          registrar(PETICIONES.resolverAprobacion, municipioDeDeclaracion(id), { id, estado, observacion })
        },

        guardarConfiguracion: (config) => {
          set((s) => ({
            configuraciones: s.configuraciones.map((c) => (c.municipioId === config.municipioId ? config : c)),
          }))
          registrar(PETICIONES.guardarConfiguracion, config.municipioId, { ...config })
        },

        cargarActividades: (municipioId, vigencia, tarifas, archivo) => {
          const usuario = usuarioActual()
          const carga = { municipioId, vigencia, tarifas, archivo, cargadoPor: usuario ? nombreCompleto(usuario) : '', fechaCarga: hoy() }
          set((s) => ({
            actividades: [...s.actividades.filter((a) => a.municipioId !== municipioId || a.vigencia !== vigencia), carga],
          }))
          registrar(PETICIONES.cargarActividades, municipioId, { municipioId, vigencia, archivo, tarifas })
        },

        guardarUsuario: (usuario) => {
          const existe = get().usuarios.some((u) => u.id === usuario.id)
          set((s) => ({
            usuarios: existe ? s.usuarios.map((u) => (u.id === usuario.id ? usuario : u)) : [...s.usuarios, usuario],
          }))
          registrar(existe ? PETICIONES.editarUsuario : PETICIONES.crearUsuario, usuario.municipioId, { ...usuario })
        },

        alternarUsuario: (id) => {
          const u = get().usuarios.find((x) => x.id === id)
          if (!u) return
          set((s) => ({ usuarios: s.usuarios.map((x) => (x.id === id ? { ...x, activo: !x.activo } : x)) }))
          registrar(PETICIONES.cambiarEstadoUsuario, u.municipioId, { id, activo: !u.activo })
        },
        eliminarUsuario: (id) => {
          const municipioId = get().usuarios.find((u) => u.id === id)?.municipioId ?? null
          set((s) => ({ usuarios: s.usuarios.filter((u) => u.id !== id) }))
          registrar(PETICIONES.eliminarUsuario, municipioId, { id })
        },
        alternarMunicipio: (id) => alternarModulo(id, 'activo'),
        cambiarDeclaracionesDesde: (municipioId, fecha) => {
          cambiarMunicipio(municipioId, { declaracionesDesde: fecha })
          registrar(PETICIONES.cambiarDeclaracionesDesde, municipioId, { municipioId, fecha })
        },
        alternarImpuesto: (municipioId, impuesto) => alternarModuloPorImpuesto(municipioId, 'impuestos', impuesto),
        alternarRit: (municipioId) => alternarModulo(municipioId, 'rit'),
        alternarValidacionRit: (municipioId, impuesto) => alternarModuloPorImpuesto(municipioId, 'validarContraRit', impuesto),
        alternarAprobacionPrevia: (municipioId, impuesto) => alternarModuloPorImpuesto(municipioId, 'aprobacionPrevia', impuesto),
        alternarCargaAsobancaria: (municipioId) => alternarModulo(municipioId, 'cargaAsobancaria'),
        alternarPagoEfectivo: (municipioId, impuesto) => alternarModuloPorImpuesto(municipioId, 'pagoEfectivo', impuesto),

        registrarPagoVentanilla: (declaracionId, valor, recibo) => {
          const usuario = usuarioActual()
          set((s) => ({
            pagos: [
              ...s.pagos,
              {
                id: `p${s.pagos.length + 1}`,
                declaracionId,
                fecha: hoy(),
                valor,
                medio: 'Ventanilla del municipio',
                recibo,
                registradoPor: usuario ? nombreCompleto(usuario) : undefined,
              },
            ],
          }))
          registrar(PETICIONES.registrarPagoVentanilla, municipioDeDeclaracion(declaracionId), { declaracionId, valor, recibo })
        },

        alternarPagoCheque: (municipioId, impuesto) => alternarModuloPorImpuesto(municipioId, 'pagoCheque', impuesto),

        recibirCheque: (declaracionId, cheque) => {
          const usuario = usuarioActual()
          set((s) => ({
            cheques: [
              ...s.cheques,
              { ...cheque, id: `ch${s.cheques.length + 1}`, declaracionId, fechaRecibo: hoy(), recibidoPor: usuario ? nombreCompleto(usuario) : '', estado: 'en_canje' },
            ],
          }))
          registrar(PETICIONES.recibirCheque, municipioDeDeclaracion(declaracionId), { declaracionId, ...cheque })
        },

        // Un cheque que ya no está en canje no se puede confirmar ni devolver: la petición falla.
        confirmarCheque: (id) => {
          const usuario = usuarioActual()
          const c = get().cheques.find((x) => x.id === id)
          const exito = c?.estado === 'en_canje'
          if (c && exito) {
            set((s) => ({
              cheques: s.cheques.map((x) => (x.id === id ? { ...x, estado: 'pagado', fechaResolucion: hoy(), resueltoPor: usuario ? nombreCompleto(usuario) : '' } : x)),
              pagos: [
                ...s.pagos,
                { id: `p${s.pagos.length + 1}`, declaracionId: c.declaracionId, fecha: c.fechaRecibo, valor: c.valor, medio: 'Cheque de gerencia', recibo: c.recibo, registradoPor: c.recibidoPor },
              ],
            }))
          }
          registrar(PETICIONES.confirmarCheque, municipioDeDeclaracion(c?.declaracionId), { id }, exito)
        },

        devolverCheque: (id, motivo) => {
          const usuario = usuarioActual()
          const c = get().cheques.find((x) => x.id === id)
          const exito = c?.estado === 'en_canje'
          if (exito) {
            set((s) => ({
              cheques: s.cheques.map((x) =>
                x.id === id ? { ...x, estado: 'devuelto', fechaResolucion: hoy(), resueltoPor: usuario ? nombreCompleto(usuario) : '', motivoDevolucion: motivo } : x,
              ),
            }))
          }
          registrar(PETICIONES.devolverCheque, municipioDeDeclaracion(c?.declaracionId), { id, motivo }, exito)
        },

        reiniciarDemo: () => set({ ...generarDatos(), municipioSeleccionado: null }),
      }
    },
    { name: 'gestor-pagos-demo', version: 40 },
  ),
)
