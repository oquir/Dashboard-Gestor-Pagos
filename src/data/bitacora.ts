// Bitácora de la demo: datos de prueba de lo que hicieron los usuarios entre agosto y octubre de 2026.
// Los cambios terminan en los valores que hoy tiene la demo, para que la bitácora no contradiga lo que se ve en las pantallas.
import { etiquetaEstadoNovedad, etiquetaFormulario, etiquetaTipoNovedad, formatoFecha, formatoPesos, nombreCompleto } from '../lib/formato'
import type { CategoriaBitacora, Datos, Formulario, RegistroBitacora } from '../types'
import { crearAzar, fechaAleatoria } from './azar'
import type { Azar } from './azar'

/** Desde cuándo hay bitácora en la demo y hasta cuándo llegan sus datos. */
const DESDE = '2026-08-01'
const HASTA = '2026-10-21'

interface Accion {
  fechaHora: string
  usuarioId: string
  municipioId: string | null
  categoria: CategoriaBitacora
  accion: string
  antes?: string
  despues?: string
}

/**
 * Cambios escritos a mano, de 1cero1 y de los administradores. Incluye un cambio de madrugada (Carlos Restrepo, el
 * 9 de septiembre a la 1 a. m.), que es el caso para el que el municipio le pregunta a 1cero1 quién cambió qué.
 */
const ESCRITAS: Accion[] = [
  // 1cero1: lo que activa en cada municipio y los usuarios que crea.
  { fechaHora: '2026-08-04T09:15', usuarioId: 'u1', municipioId: 'm2', categoria: 'municipios', accion: 'Activó la aprobación previa del ICA anual', antes: 'Apagada', despues: 'Encendida' },
  { fechaHora: '2026-08-04T09:22', usuarioId: 'u1', municipioId: 'm2', categoria: 'municipios', accion: 'Habilitó el pago en efectivo en ventanilla de ReteICA', antes: 'No', despues: 'Sí' },
  { fechaHora: '2026-08-11T10:40', usuarioId: 'u1', municipioId: 'm3', categoria: 'municipios', accion: 'Habilitó el pago en efectivo en ventanilla de ReteICA', antes: 'No', despues: 'Sí' },
  { fechaHora: '2026-08-11T10:46', usuarioId: 'u1', municipioId: 'm3', categoria: 'municipios', accion: 'Habilitó los cheques de gerencia en ventanilla de ReteICA', antes: 'No', despues: 'Sí' },
  { fechaHora: '2026-08-19T15:05', usuarioId: 'u1', municipioId: 'm1', categoria: 'municipios', accion: 'Habilitó la carga del Asobancaria 2001', antes: 'No', despues: 'Sí' },
  { fechaHora: '2026-08-03T08:30', usuarioId: 'u1', municipioId: 'm3', categoria: 'usuarios', accion: 'Creó el usuario Sandra Vega', despues: 'Funcionario municipio · s.vega@santarosa.demo' },
  { fechaHora: '2026-08-03T08:31', usuarioId: 'u1', municipioId: 'm3', categoria: 'usuarios', accion: 'Envió las credenciales de acceso a Sandra Vega', despues: 's.vega@santarosa.demo' },
  { fechaHora: '2026-09-15T11:20', usuarioId: 'u1', municipioId: 'm2', categoria: 'usuarios', accion: 'Reenvió las credenciales de acceso a Marcela Díaz', despues: 'm.diaz@puertoesperanza.demo' },
  { fechaHora: '2026-10-06T16:10', usuarioId: 'u1', municipioId: 'm1', categoria: 'municipios', accion: 'Cambió la fecha desde la que se reciben declaraciones en el aplicativo', antes: formatoFecha('2026-03-01'), despues: formatoFecha('2026-02-01') },
  { fechaHora: '2026-10-20T19:45', usuarioId: 'u1', municipioId: 'm2', categoria: 'configuracion', accion: 'Cambió la base mínima de compras de ReteICA', antes: '30 UVT', despues: '27 UVT' },

  // San José del Valle: Carlos Restrepo, administrador.
  { fechaHora: '2026-09-09T01:05', usuarioId: 'u2', municipioId: 'm1', categoria: 'sesion', accion: 'Inició sesión' },
  { fechaHora: '2026-09-09T01:12', usuarioId: 'u2', municipioId: 'm1', categoria: 'configuracion', accion: 'Cambió la sobretasa bomberil', antes: '3 % del ICA', despues: '4 % del ICA' },
  { fechaHora: '2026-09-09T01:16', usuarioId: 'u2', municipioId: 'm1', categoria: 'configuracion', accion: 'Cambió el anticipo del año siguiente', antes: '30 %', despues: '40 %' },
  { fechaHora: '2026-09-22T14:30', usuarioId: 'u2', municipioId: 'm1', categoria: 'calendario', accion: 'Configuró el pronto pago del año gravable 2026', antes: 'Sin tramos', despues: `15 %, 10 % y 5 %, hasta el ${formatoFecha('2027-04-15')}` },
  { fechaHora: '2026-10-01T09:10', usuarioId: 'u2', municipioId: 'm1', categoria: 'usuarios', accion: 'Desactivó a Julián Ortiz', antes: 'Activo', despues: 'Inactivo' },
  { fechaHora: '2026-10-08T08:05', usuarioId: 'u2', municipioId: 'm1', categoria: 'usuarios', accion: 'Reactivó a Julián Ortiz', antes: 'Inactivo', despues: 'Activo' },
  { fechaHora: '2026-10-15T11:48', usuarioId: 'u2', municipioId: 'm1', categoria: 'usuarios', accion: 'Cambió el correo de Diana Gómez', antes: 'diana.gomez.rentas@gmail.com', despues: 'd.gomez@sanjosedelvalle.demo' },

  // Puerto Esperanza: Marcela Díaz, administradora.
  { fechaHora: '2026-08-27T15:40', usuarioId: 'u5', municipioId: 'm2', categoria: 'configuracion', accion: 'Activó la exigencia de la declaración en ceros', antes: 'No', despues: 'Sí' },
  {
    fechaHora: '2026-09-30T10:25', usuarioId: 'u5', municipioId: 'm2', categoria: 'calendario', accion: 'Cambió el vencimiento del ICA anual 2026 a fechas por último dígito',
    antes: `Una fecha: ${formatoFecha('2027-03-31')}`, despues: `Del ${formatoFecha('2027-04-05')} al ${formatoFecha('2027-04-16')}, según el dígito`,
  },
  { fechaHora: '2026-10-13T17:05', usuarioId: 'u5', municipioId: 'm2', categoria: 'usuarios', accion: 'Cambió el cargo de Andrés Barrios', antes: 'Técnico de Rentas', despues: 'Profesional de Fiscalización' },

  // Santa Rosa de los Andes: Jorge Pardo, administrador.
  { fechaHora: '2026-08-18T09:00', usuarioId: 'u7', municipioId: 'm3', categoria: 'configuracion', accion: 'Rebajó la sanción por extemporaneidad', antes: '5 % por mes', despues: '4 % por mes' },
  { fechaHora: '2026-08-18T09:02', usuarioId: 'u7', municipioId: 'm3', categoria: 'configuracion', accion: 'Rebajó la sanción por corrección', antes: '10 %', despues: '8 %' },
  { fechaHora: '2026-09-24T16:20', usuarioId: 'u7', municipioId: 'm3', categoria: 'calendario', accion: 'Cambió el vencimiento de AutoReteICA, bimestre 6 de 2026', antes: formatoFecha('2027-01-19'), despues: formatoFecha('2026-12-21') },
  { fechaHora: '2026-10-02T07:50', usuarioId: 'u7', municipioId: 'm3', categoria: 'configuracion', accion: 'Ocultó a los funcionarios el recaudo del municipio', antes: 'No', despues: 'Sí' },
]

const hora = (az: Azar, desde = 7, hasta = 17) =>
  `${String(az.entero(desde, hasta)).padStart(2, '0')}:${String(az.entero(0, 59)).padStart(2, '0')}`

/** Los registros más recientes primero. Usa su propio azar para no cambiar el resto de los datos. */
export function generarBitacora(datos: Omit<Datos, 'bitacora'>): RegistroBitacora[] {
  const az = crearAzar(2604)
  const porNombre = new Map(datos.usuarios.map((u) => [nombreCompleto(u), u]))
  const enRango = (fecha: string) => fecha >= DESDE && fecha <= HASTA
  const acciones: Accion[] = [...ESCRITAS]

  // Lo que ya está en los datos de la demo y cae en esas fechas: solicitudes del RIT revisadas y cheques recibidos.
  for (const ins of datos.inscripciones) {
    for (const n of ins.novedades) {
      const revisor = n.revisadaPor && porNombre.get(n.revisadaPor)
      if (!revisor || !n.fechaRevision || !enRango(n.fechaRevision) || n.estado === 'pendiente') continue
      acciones.push({
        fechaHora: `${n.fechaRevision}T${hora(az)}`, usuarioId: revisor.id, municipioId: ins.municipioId, categoria: 'rit',
        accion: `${n.estado === 'aprobada' ? 'Aprobó' : 'Rechazó'} la solicitud de ${etiquetaTipoNovedad[n.tipo].toLowerCase()} de ${ins.nombre}`,
        antes: etiquetaEstadoNovedad.pendiente, despues: etiquetaEstadoNovedad[n.estado],
      })
    }
  }
  for (const c of datos.cheques) {
    const quien = porNombre.get(c.recibidoPor)
    const d = datos.declaraciones.find((x) => x.id === c.declaracionId)
    if (!quien || !d || !enRango(c.fechaRecibo)) continue
    acciones.push({
      fechaHora: `${c.fechaRecibo}T${hora(az)}`, usuarioId: quien.id, municipioId: d.municipioId, categoria: 'pagos',
      accion: `Recibió un cheque de gerencia para la declaración ${d.numero}`, despues: `${c.banco} n.º ${c.numero} por ${formatoPesos(c.valor)} · recibo ${c.recibo}`,
    })
  }
  for (const pausa of datos.configuraciones.flatMap((cfg) => Object.entries(cfg.formulariosDesactivados).map(([f, p]) => ({ cfg, f, p })))) {
    const quien = porNombre.get(pausa.p.por)
    if (!quien || !enRango(pausa.p.fecha)) continue
    acciones.push({
      fechaHora: `${pausa.p.fecha}T18:32`, usuarioId: quien.id, municipioId: pausa.cfg.municipioId, categoria: 'configuracion',
      accion: `Desactivó para los contribuyentes el formulario de ${etiquetaFormulario[pausa.f as Formulario]}`,
      antes: 'Activo', despues: `Desactivado: ${pausa.p.motivo}`,
    })
  }

  // Inicios de sesión en horario de oficina; Julián Ortiz no entra mientras está desactivado.
  for (const u of datos.usuarios) {
    for (let i = az.entero(3, 6); i > 0; i--) {
      const fecha = fechaAleatoria(az, DESDE, HASTA)
      const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay()
      if (dia === 0 || dia === 6 || (u.id === 'u4' && fecha >= '2026-10-01' && fecha < '2026-10-08')) continue
      acciones.push({ fechaHora: `${fecha}T${hora(az, 7, 11)}`, usuarioId: u.id, municipioId: u.municipioId, categoria: 'sesion', accion: 'Inició sesión' })
    }
  }

  const usuarios = new Map(datos.usuarios.map((u) => [u.id, u]))
  return acciones
    .filter((a) => usuarios.has(a.usuarioId))
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora))
    .map(({ usuarioId, ...a }, i) => {
      const u = usuarios.get(usuarioId)!
      return { id: `b${i + 1}`, ...a, usuario: { id: u.id, nombre: nombreCompleto(u), rol: u.rol } }
    })
}
