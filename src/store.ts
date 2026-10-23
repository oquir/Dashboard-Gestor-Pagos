// Estado de la demo. Vive en el navegador (localStorage): no hay API.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generarDatos } from './data/generar'
import { nombreCompleto } from './lib/formato'
import type { Archivo, ConfigMunicipio, Datos, EstadoNovedad, EstadoRevision, Impuesto, Usuario } from './types'

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
  revisarDeclaracion: (id: string, estado: EstadoRevision, observacion: string) => void
  guardarConfiguracion: (config: ConfigMunicipio) => void
  guardarUsuario: (usuario: Usuario) => void
  alternarUsuario: (id: string) => void
  alternarMunicipio: (id: string) => void
  /** Activa o desactiva un impuesto del municipio; siempre debe quedar al menos uno activo. */
  alternarImpuesto: (municipioId: string, impuesto: Impuesto) => void
  alternarRit: (municipioId: string) => void
  /** Activa o desactiva la validación contra el RIT de un formulario del municipio. */
  alternarValidacionRit: (municipioId: string, impuesto: Impuesto) => void
  reiniciarDemo: () => void
}

const hoy = () => new Date().toISOString().slice(0, 10)

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

      revisarDeclaracion: (id, estado, observacion) =>
        set((s) => ({
          declaraciones: s.declaraciones.map((d) => (d.id === id ? { ...d, estadoRevision: estado, observacion: observacion || undefined } : d)),
        })),

      guardarConfiguracion: (config) =>
        set((s) => ({
          configuraciones: s.configuraciones.map((c) => (c.municipioId === config.municipioId ? config : c)),
        })),

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

      reiniciarDemo: () => set({ ...generarDatos(), municipioSeleccionado: null }),
    }),
    { name: 'gestor-pagos-demo', version: 15 },
  ),
)
