// Bitácora de la demo: datos de prueba de las peticiones que hicieron los usuarios entre agosto y octubre de 2026.
// Los datos enviados terminan en los valores que hoy tiene la demo, para que la bitácora no contradiga lo que se ve en las pantallas.
import { PETICIONES } from '../constants'
import type { Peticion } from '../constants'
import { nombreCompleto } from '../lib/formato'
import type { Datos, RegistroBitacora } from '../types'
import { crearAzar, fechaAleatoria } from './azar'
import type { Azar } from './azar'

/** Desde cuándo hay bitácora en la demo y hasta cuándo llegan sus datos. */
const DESDE = '2026-08-01'
const HASTA = '2026-10-21'

interface Llamada {
  fechaHora: string
  usuarioId: string
  municipioId: string | null
  peticion: Peticion
  datos: Record<string, unknown>
  exito: boolean
}

const llamada = (
  fechaHora: string,
  usuarioId: string,
  municipioId: string | null,
  peticion: Peticion,
  datos: Record<string, unknown>,
  exito = true,
): Llamada => ({ fechaHora, usuarioId, municipioId, peticion, datos, exito })

/**
 * Peticiones escritas a mano, de 1cero1 y de los administradores. Incluye una de madrugada (Carlos Restrepo guarda la
 * configuración de San José del Valle el 9 de septiembre a la 1 a. m.), que es el caso para el que el municipio le
 * pregunta a 1cero1 quién cambió qué, y una que falló y se repitió a los pocos minutos.
 */
function escritas(datos: Omit<Datos, 'bitacora'>): Llamada[] {
  const config = (municipioId: string) => ({ ...datos.configuraciones.find((c) => c.municipioId === municipioId)! })
  const municipio = (id: string) => datos.municipios.find((m) => m.id === id)!
  const usuario = (id: string) => ({ ...datos.usuarios.find((u) => u.id === id)! })
  const correo = (id: string) => ({ correo: usuario(id).correo })

  return [
    // 1cero1: lo que activa en cada municipio y los usuarios que crea.
    llamada('2026-08-03T08:30', 'u1', 'm3', PETICIONES.crearUsuario, usuario('u8')),
    llamada('2026-08-04T09:15', 'u1', 'm2', PETICIONES.cambiarModulo, { municipioId: 'm2', aprobacionPrevia: { ica: municipio('m2').aprobacionPrevia.ica } }),
    llamada('2026-08-04T09:22', 'u1', 'm2', PETICIONES.cambiarModulo, { municipioId: 'm2', pagoEfectivo: { reteica: municipio('m2').pagoEfectivo.reteica } }),
    llamada('2026-08-11T10:40', 'u1', 'm3', PETICIONES.cambiarModulo, { municipioId: 'm3', pagoEfectivo: { reteica: municipio('m3').pagoEfectivo.reteica } }),
    llamada('2026-08-11T10:46', 'u1', 'm3', PETICIONES.cambiarModulo, { municipioId: 'm3', pagoCheque: { reteica: municipio('m3').pagoCheque.reteica } }),
    llamada('2026-08-19T15:05', 'u1', 'm1', PETICIONES.cambiarModulo, { municipioId: 'm1', cargaAsobancaria: municipio('m1').cargaAsobancaria }),
    llamada('2026-10-06T16:10', 'u1', 'm1', PETICIONES.cambiarEnProduccionDesde, { municipioId: 'm1', formulario: 'ica', fecha: municipio('m1').enProduccionDesde.ica }),
    llamada('2026-10-20T19:41', 'u1', 'm2', PETICIONES.guardarConfiguracion, config('m2'), false),
    llamada('2026-10-20T19:45', 'u1', 'm2', PETICIONES.guardarConfiguracion, config('m2')),

    // San José del Valle: Carlos Restrepo, administrador.
    llamada('2026-09-09T01:05', 'u2', 'm1', PETICIONES.iniciarSesion, correo('u2')),
    llamada('2026-09-09T01:14', 'u2', 'm1', PETICIONES.guardarConfiguracion, config('m1')),
    llamada('2026-09-22T14:30', 'u2', 'm1', PETICIONES.guardarConfiguracion, config('m1')),
    llamada('2026-10-01T09:10', 'u2', 'm1', PETICIONES.cambiarEstadoUsuario, { id: 'u4', activo: false }),
    llamada('2026-10-08T08:05', 'u2', 'm1', PETICIONES.cambiarEstadoUsuario, { id: 'u4', activo: true }),
    llamada('2026-10-15T11:48', 'u2', 'm1', PETICIONES.editarUsuario, usuario('u3')),

    // Puerto Esperanza: Marcela Díaz, administradora.
    llamada('2026-08-27T15:40', 'u5', 'm2', PETICIONES.guardarConfiguracion, config('m2')),
    llamada('2026-09-30T10:25', 'u5', 'm2', PETICIONES.guardarConfiguracion, config('m2')),
    llamada('2026-10-13T17:05', 'u5', 'm2', PETICIONES.editarUsuario, usuario('u6')),

    // Santa Rosa de los Andes: Jorge Pardo, administrador.
    llamada('2026-08-18T09:00', 'u7', 'm3', PETICIONES.guardarConfiguracion, config('m3')),
    llamada('2026-09-24T16:20', 'u7', 'm3', PETICIONES.guardarConfiguracion, config('m3')),
    llamada('2026-10-02T07:50', 'u7', 'm3', PETICIONES.guardarConfiguracion, config('m3')),
  ]
}

const hora = (az: Azar, desde = 7, hasta = 17) =>
  `${String(az.entero(desde, hasta)).padStart(2, '0')}:${String(az.entero(0, 59)).padStart(2, '0')}`

/** Numerados del más antiguo al más reciente, y los más recientes primero. Usa su propio azar para no cambiar el resto de los datos. */
export function generarBitacora(datos: Omit<Datos, 'bitacora'>): RegistroBitacora[] {
  const az = crearAzar(2604)
  const porNombre = new Map(datos.usuarios.map((u) => [nombreCompleto(u), u]))
  const enRango = (fecha: string) => fecha >= DESDE && fecha <= HASTA
  const llamadas = escritas(datos)

  // Lo que ya está en los datos de la demo y cae en esas fechas: solicitudes del RIT revisadas, cheques recibidos y
  // formularios que el municipio desactivó desde Configuración.
  for (const ins of datos.inscripciones) {
    for (const n of ins.novedades) {
      const revisor = n.revisadaPor && porNombre.get(n.revisadaPor)
      if (!revisor || !n.fechaRevision || !enRango(n.fechaRevision) || n.estado === 'pendiente') continue
      llamadas.push(
        llamada(`${n.fechaRevision}T${hora(az)}`, revisor.id, ins.municipioId, PETICIONES.resolverNovedad, {
          inscripcionId: ins.id,
          novedadId: n.id,
          estado: n.estado,
          observacion: n.observacion ?? '',
          documentos: (n.documentosRespuesta ?? []).map((d) => d.nombre),
        }),
      )
    }
  }
  for (const c of datos.cheques) {
    const quien = porNombre.get(c.recibidoPor)
    const d = datos.declaraciones.find((x) => x.id === c.declaracionId)
    if (!quien || !d || !enRango(c.fechaRecibo)) continue
    const { declaracionId, valor, banco, numero, recibo } = c
    llamadas.push(llamada(`${c.fechaRecibo}T${hora(az)}`, quien.id, d.municipioId, PETICIONES.recibirCheque, { declaracionId, valor, banco, numero, recibo }))
  }
  for (const cfg of datos.configuraciones) {
    for (const pausa of Object.values(cfg.formulariosDesactivados)) {
      const quien = porNombre.get(pausa.por)
      if (!quien || !enRango(pausa.fecha)) continue
      llamadas.push(llamada(`${pausa.fecha}T18:32`, quien.id, cfg.municipioId, PETICIONES.guardarConfiguracion, { ...cfg }))
    }
  }

  // Inicios de sesión en horario de oficina; Julián Ortiz no entra mientras está desactivado.
  for (const u of datos.usuarios) {
    for (let i = az.entero(3, 6); i > 0; i--) {
      const fecha = fechaAleatoria(az, DESDE, HASTA)
      const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay()
      if (dia === 0 || dia === 6 || (u.id === 'u4' && fecha >= '2026-10-01' && fecha < '2026-10-08')) continue
      llamadas.push(llamada(`${fecha}T${hora(az, 7, 11)}`, u.id, u.municipioId, PETICIONES.iniciarSesion, { correo: u.correo }))
    }
  }

  const usuarios = new Map(datos.usuarios.map((u) => [u.id, u]))
  return llamadas
    .filter((l) => usuarios.has(l.usuarioId))
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))
    .map(({ usuarioId, peticion, ...l }, i) => {
      const u = usuarios.get(usuarioId)!
      return { id: i + 1, ...l, ...peticion, usuario: { id: u.id, nombre: nombreCompleto(u), rol: u.rol } }
    })
    .reverse()
}
