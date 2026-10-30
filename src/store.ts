// Estado de la demo. Vive en el navegador (localStorage): no hay API.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generarDatos } from './data/generar'
import { nombreCompleto } from './lib/formato'
import type { Archivo, Cheque, ConfigMunicipio, Datos, EstadoNovedad, Impuesto, Tarifa, Usuario } from './types'
import { hoy } from './utils'

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
  alternarMunicipio: (id: string) => void
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
    (set, get) => ({
      ...generarDatos(),
      usuarioId: null,
      municipioSeleccionado: null,

      iniciarSesion: (usuarioId) => set({ usuarioId, municipioSeleccionado: null }),
      cerrarSesion: () => set({ usuarioId: null }),
      seleccionarMunicipio: (id) => set({ municipioSeleccionado: id }),

      resolverNovedad: (inscripcionId, novedadId, estado, observacion, documentos) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
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
      },

      resolverAprobacion: (id, estado, observacion) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
        const por = usuario ? nombreCompleto(usuario) : ''
        set((s) => ({
          declaraciones: s.declaraciones.map((d) =>
            d.id === id ? { ...d, aprobacion: { estado, fecha: hoy(), por, observacion: observacion || undefined } } : d,
          ),
        }))
      },

      guardarConfiguracion: (config) =>
        set((s) => ({
          configuraciones: s.configuraciones.map((c) => (c.municipioId === config.municipioId ? config : c)),
        })),

      cargarActividades: (municipioId, vigencia, tarifas, archivo) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
        const carga = { municipioId, vigencia, tarifas, archivo, cargadoPor: usuario ? nombreCompleto(usuario) : '', fechaCarga: hoy() }
        set((s) => ({
          actividades: [...s.actividades.filter((a) => a.municipioId !== municipioId || a.vigencia !== vigencia), carga],
        }))
      },

      guardarUsuario: (usuario) =>
        set((s) => ({
          usuarios: s.usuarios.some((u) => u.id === usuario.id)
            ? s.usuarios.map((u) => (u.id === usuario.id ? usuario : u))
            : [...s.usuarios, usuario],
        })),

      alternarUsuario: (id) => set((s) => ({ usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)) })),
      alternarMunicipio: (id) => set((s) => ({ municipios: s.municipios.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m)) })),
      alternarImpuesto: (municipioId, impuesto) =>
        set((s) => ({
          municipios: s.municipios.map((m) => {
            if (m.id !== municipioId) return m
            const impuestos = { ...m.impuestos, [impuesto]: !m.impuestos[impuesto] }
            return Object.values(impuestos).some(Boolean) ? { ...m, impuestos } : m
          }),
        })),
      alternarRit: (municipioId) => set((s) => ({ municipios: s.municipios.map((m) => (m.id === municipioId ? { ...m, rit: !m.rit } : m)) })),
      alternarValidacionRit: (municipioId, impuesto) =>
        set((s) => ({
          municipios: s.municipios.map((m) =>
            m.id === municipioId ? { ...m, validarContraRit: { ...m.validarContraRit, [impuesto]: !m.validarContraRit[impuesto] } } : m,
          ),
        })),

      alternarAprobacionPrevia: (municipioId, impuesto) =>
        set((s) => ({
          municipios: s.municipios.map((m) =>
            m.id === municipioId ? { ...m, aprobacionPrevia: { ...m.aprobacionPrevia, [impuesto]: !m.aprobacionPrevia[impuesto] } } : m,
          ),
        })),

      alternarCargaAsobancaria: (municipioId) =>
        set((s) => ({ municipios: s.municipios.map((m) => (m.id === municipioId ? { ...m, cargaAsobancaria: !m.cargaAsobancaria } : m)) })),
      alternarPagoEfectivo: (municipioId, impuesto) =>
        set((s) => ({
          municipios: s.municipios.map((m) => (m.id === municipioId ? { ...m, pagoEfectivo: { ...m.pagoEfectivo, [impuesto]: !m.pagoEfectivo[impuesto] } } : m)),
        })),

      registrarPagoVentanilla: (declaracionId, valor, recibo) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
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
      },

      alternarPagoCheque: (municipioId, impuesto) =>
        set((s) => ({
          municipios: s.municipios.map((m) => (m.id === municipioId ? { ...m, pagoCheque: { ...m.pagoCheque, [impuesto]: !m.pagoCheque[impuesto] } } : m)),
        })),

      recibirCheque: (declaracionId, cheque) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
        set((s) => ({
          cheques: [
            ...s.cheques,
            { ...cheque, id: `ch${s.cheques.length + 1}`, declaracionId, fechaRecibo: hoy(), recibidoPor: usuario ? nombreCompleto(usuario) : '', estado: 'en_canje' },
          ],
        }))
      },

      confirmarCheque: (id) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
        const c = get().cheques.find((x) => x.id === id)
        if (!c || c.estado !== 'en_canje') return
        set((s) => ({
          cheques: s.cheques.map((x) => (x.id === id ? { ...x, estado: 'pagado', fechaResolucion: hoy(), resueltoPor: usuario ? nombreCompleto(usuario) : '' } : x)),
          pagos: [
            ...s.pagos,
            { id: `p${s.pagos.length + 1}`, declaracionId: c.declaracionId, fecha: c.fechaRecibo, valor: c.valor, medio: 'Cheque de gerencia', recibo: c.recibo, registradoPor: c.recibidoPor },
          ],
        }))
      },

      devolverCheque: (id, motivo) => {
        const usuario = get().usuarios.find((u) => u.id === get().usuarioId)
        set((s) => ({
          cheques: s.cheques.map((x) =>
            x.id === id && x.estado === 'en_canje'
              ? { ...x, estado: 'devuelto', fechaResolucion: hoy(), resueltoPor: usuario ? nombreCompleto(usuario) : '', motivoDevolucion: motivo }
              : x,
          ),
        }))
      },

      reiniciarDemo: () => set({ ...generarDatos(), municipioSeleccionado: null }),
    }),
    { name: 'gestor-pagos-demo', version: 26 },
  ),
)
