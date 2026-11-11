// Bitácora de la demo: datos de prueba de las peticiones que hicieron los usuarios entre agosto y octubre de 2026.
// Los datos enviados terminan en los valores que hoy tiene la demo, para que la bitácora no contradiga lo que se ve en las pantallas.
import { REQUESTS } from '../constants'
import type { LogRequest } from '../constants'
import { sentData } from '../lib/summonses'
import { fullName } from '../lib/format'
import type { Data, Summons, AuditLogEntry } from '../types'
import { createRandom, randomDate } from './random'
import type { Random } from './random'

/** Desde cuándo hay bitácora en la demo y hasta cuándo llegan sus datos. */
const FROM = '2026-08-01'
const TO = '2026-10-21'

interface Call {
  dateTime: string
  userId: string
  municipalityId: string | null
  request: LogRequest
  data: Record<string, unknown>
  success: boolean
}

const call = (
  dateTime: string,
  userId: string,
  municipalityId: string | null,
  request: LogRequest,
  data: Record<string, unknown>,
  success = true,
): Call => ({ dateTime, userId, municipalityId, request, data, success })

/**
 * Peticiones escritas a mano, de 1cero1 y de los administradores. Incluye una de madrugada (Carlos Restrepo guarda la
 * configuración de Villeta el 9 de septiembre a la 1 a. m.), que es el caso para el que el municipio le
 * pregunta a 1cero1 quién cambió qué, y una que falló y se repitió a los pocos minutos.
 */
function written(data: Omit<Data, 'auditLog'>): Call[] {
  const config = (municipalityId: string) => ({
    ...data.settingsList.find((c) => c.municipalityId === municipalityId)!,
  })
  const municipality = (id: string) => data.municipalities.find((m) => m.id === id)!
  const user = (id: string) => ({ ...data.users.find((u) => u.id === id)! })
  const email = (id: string) => ({ email: user(id).email })

  return [
    // 1cero1: lo que activa en cada municipio y los usuarios que crea.
    call('2026-08-03T08:30', 'u1', 'm3', REQUESTS.createUser, user('u8')),
    call('2026-08-04T09:15', 'u1', 'm2', REQUESTS.changeModule, {
      municipalityId: 'm2',
      priorApproval: { ica: municipality('m2').priorApproval.ica },
    }),
    call('2026-08-04T09:22', 'u1', 'm2', REQUESTS.changeModule, {
      municipalityId: 'm2',
      cashPayment: { reteica: municipality('m2').cashPayment.reteica },
    }),
    call('2026-08-11T10:40', 'u1', 'm3', REQUESTS.changeModule, {
      municipalityId: 'm3',
      cashPayment: { reteica: municipality('m3').cashPayment.reteica },
    }),
    call('2026-08-11T10:46', 'u1', 'm3', REQUESTS.changeModule, {
      municipalityId: 'm3',
      checkPayment: { reteica: municipality('m3').checkPayment.reteica },
    }),
    call('2026-08-19T15:05', 'u1', 'm1', REQUESTS.changeModule, {
      municipalityId: 'm1',
      asobancariaUpload: municipality('m1').asobancariaUpload,
    }),
    call('2026-10-06T16:10', 'u1', 'm1', REQUESTS.changeModule, {
      municipalityId: 'm1',
      checkPayment: { ica: municipality('m1').checkPayment.ica },
    }),
    call('2026-10-20T19:41', 'u1', 'm2', REQUESTS.saveSettings, config('m2'), false),
    call('2026-10-20T19:45', 'u1', 'm2', REQUESTS.saveSettings, config('m2')),

    // Villeta: Carlos Restrepo, administrador.
    call('2026-09-09T01:05', 'u2', 'm1', REQUESTS.logIn, email('u2')),
    call('2026-09-09T01:14', 'u2', 'm1', REQUESTS.saveSettings, config('m1')),
    call('2026-09-22T14:30', 'u2', 'm1', REQUESTS.saveSettings, config('m1')),
    call('2026-10-01T09:10', 'u2', 'm1', REQUESTS.changeUserStatus, {
      id: 'u4',
      isActive: false,
    }),
    call('2026-10-08T08:05', 'u2', 'm1', REQUESTS.changeUserStatus, {
      id: 'u4',
      isActive: true,
    }),
    call('2026-10-15T11:48', 'u2', 'm1', REQUESTS.editUser, user('u3')),

    // Ricaurte: Marcela Díaz, administradora.
    call('2026-08-27T15:40', 'u5', 'm2', REQUESTS.saveSettings, config('m2')),
    call('2026-09-30T10:25', 'u5', 'm2', REQUESTS.saveSettings, config('m2')),
    call('2026-10-13T17:05', 'u5', 'm2', REQUESTS.editUser, user('u6')),

    // Garzón: Jorge Pardo, administrador.
    call('2026-08-18T09:00', 'u7', 'm3', REQUESTS.saveSettings, config('m3')),
    call('2026-09-24T16:20', 'u7', 'm3', REQUESTS.saveSettings, config('m3')),
    call('2026-10-02T07:50', 'u7', 'm3', REQUESTS.saveSettings, config('m3')),
  ]
}

const time = (az: Random, from = 7, to = 17) =>
  `${String(az.integer(from, to)).padStart(2, '0')}:${String(az.integer(0, 59)).padStart(2, '0')}`

/** Numerados del más antiguo al más reciente, y los más recientes primero. Usa su propio azar para no cambiar el resto de los datos. */
export function generateAuditLog(data: Omit<Data, 'auditLog'>): AuditLogEntry[] {
  const az = createRandom(2604)
  const byName = new Map(data.users.map((u) => [fullName(u), u]))
  const inRange = (date: string) => date >= FROM && date <= TO
  const calls = written(data)

  // Lo que ya está en los datos de la demo y cae en esas fechas: solicitudes del RIT revisadas, cheques recibidos y
  // formularios que el municipio desactivó desde Configuración.
  for (const reg of data.registrations) {
    for (const n of reg.ritChanges) {
      const reviewer = n.reviewedBy && byName.get(n.reviewedBy)
      if (!reviewer || !n.reviewDate || !inRange(n.reviewDate) || n.status === 'pending') continue
      calls.push(
        call(
          `${n.reviewDate}T${time(az)}`,
          reviewer.id,
          reg.municipalityId,
          REQUESTS.resolveRitChange,
          {
            registrationId: reg.id,
            ritChangeId: n.id,
            status: n.status,
            observation: n.observation ?? '',
            documents: (n.replyDocuments ?? []).map((d) => d.name),
          },
        ),
      )
    }
  }
  for (const c of data.checks) {
    const who = byName.get(c.receivedBy)
    const d = data.declarations.find((x) => x.id === c.declarationId)
    if (!who || !d || !inRange(c.receiptDate)) continue
    const { declarationId, value, bank, number, receipt } = c
    calls.push(
      call(`${c.receiptDate}T${time(az)}`, who.id, d.municipalityId, REQUESTS.receiveCheck, {
        declarationId,
        value,
        bank,
        number,
        receipt,
      }),
    )
  }
  for (const cfg of data.settingsList) {
    for (const pausa of Object.values(cfg.disabledForms)) {
      const who = byName.get(pausa.por)
      if (!who || !inRange(pausa.date)) continue
      calls.push(
        call(`${pausa.date}T18:32`, who.id, cfg.municipalityId, REQUESTS.saveSettings, { ...cfg }),
      )
    }
  }

  // Inicios de sesión en horario de oficina; Julián Ortiz no entra mientras está desactivado.
  for (const u of data.users) {
    for (let i = az.integer(3, 6); i > 0; i--) {
      const date = randomDate(az, FROM, TO)
      const day = new Date(`${date}T12:00:00Z`).getUTCDay()
      if (day === 0 || day === 6 || (u.id === 'u4' && date >= '2026-10-01' && date < '2026-10-08'))
        continue
      calls.push(
        call(`${date}T${time(az, 7, 11)}`, u.id, u.municipalityId, REQUESTS.logIn, {
          email: u.email,
        }),
      )
    }
  }

  // Las solicitudes de corrección a la baja que el municipio aceptó o rechazó en esas fechas. Van al final y con su
  // propio azar para no cambiar las horas de los demás registros.
  const randomCorrections = createRandom(589)
  for (const d of data.declarations) {
    const s = d.correctionApplication
    const who = s && s.status !== 'pending' && inRange(s.date) ? byName.get(s.por) : undefined
    if (!s || s.status === 'pending' || !who) continue
    calls.push(
      call(
        `${s.date}T${time(randomCorrections)}`,
        who.id,
        d.municipalityId,
        REQUESTS.resolveCorrection,
        { id: d.id, status: s.status, observation: s.observation ?? '' },
      ),
    )
  }

  // Los emplazamientos registrados en esas fechas: cada lote (el mismo día, del mismo funcionario) es una petición, como
  // la manda la pantalla. Van al final y con su propio azar.
  const randomSummonses = createRandom(715)
  const batches = new Map<string, Summons[]>()
  for (const e of data.summonses.filter((x) => inRange(x.recordDate))) {
    const key = `${e.municipalityId}|${e.recordDate}|${e.recordedBy}`
    batches.set(key, [...(batches.get(key) ?? []), e])
  }
  for (const batch of batches.values()) {
    const { municipalityId, recordDate, recordedBy } = batch[0]
    const who = byName.get(recordedBy)
    if (!who) continue
    calls.push(
      call(
        `${recordDate}T${time(randomSummonses)}`,
        who.id,
        municipalityId,
        REQUESTS.recordSummonses,
        {
          summonses: batch.map(sentData),
        },
      ),
    )
  }

  const users = new Map(data.users.map((u) => [u.id, u]))
  return calls
    .filter((l) => users.has(l.userId))
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    .map(({ userId, request, ...l }, i) => {
      const u = users.get(userId)!
      return {
        id: i + 1,
        ...l,
        ...request,
        user: { id: u.id, name: fullName(u), role: u.role },
      }
    })
    .reverse()
}
