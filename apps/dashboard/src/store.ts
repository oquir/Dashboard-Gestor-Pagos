// Estado de la demo. Vive en el navegador (localStorage): no hay API.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { REQUESTS } from './constants'
import type { LogRequest } from './constants'
import { generateData } from './data/generate'
import { sentData, canBeRemoved } from './lib/summonses'
import { fullName } from './lib/format'
import { correctionToResolve, correctionSituation } from './lib/rules'
import type {
  Approval,
  StoredFile,
  Check,
  MunicipalityConfig,
  Data,
  DateQuery,
  DateQueryPage,
  Summons,
  RitChangeStatus,
  Form,
  Tax,
  Municipality,
  NewSummons,
  AuditLogEntry,
  ApprovalResolution,
  Rate,
  User,
} from './types'
import { now, today } from './utils'

/** Lo del municipio que se activa por formulario. */
type ModuleByTax = 'taxes' | 'validateAgainstRit' | 'priorApproval' | 'cashPayment' | 'checkPayment'

interface StoreState extends Data {
  userId: string | null
  /** Municipio que está mirando el rol 1cero1; null = todos. */
  selectedMunicipality: string | null
  /** Rango de fechas consultado en cada página que lo pide. Es solo de la pantalla: no deja registro en la bitácora. */
  dateQueries: Partial<Record<DateQueryPage, DateQuery>>
  logIn: (userId: string) => void
  logOut: () => void
  selectMunicipality: (id: string | null) => void
  setDateQuery: (page: DateQueryPage, query: DateQuery) => void
  resolveRitChange: (
    registrationId: string,
    ritChangeId: string,
    status: Exclude<RitChangeStatus, 'pending'>,
    observation: string,
    documents: StoredFile[],
  ) => void
  /** Aprueba o rechaza una declaración con aprobación previa; se rechaza solo por una causal del art. 580. */
  resolveApproval: (
    id: string,
    resolution: ApprovalResolution,
    observation: string,
    documents: StoredFile[],
  ) => void
  /**
   * Acepta o rechaza una solicitud de corrección a la baja. Si ya no está por resolver (se resolvió o pasaron los 6 meses
   * y se aceptó por silencio), la petición falla.
   */
  resolveCorrection: (id: string, status: 'accepted' | 'rejected', observation: string) => void
  /** Registra emplazamientos ya notificados: uno, o un lote con la misma fecha de notificación. */
  recordSummonses: (newOnes: NewSummons[]) => void
  /** Quita un emplazamiento registrado por error. Si ya lo respondió una declaración, la petición falla. */
  removeSummons: (id: string) => void
  saveSettings: (config: MunicipalityConfig) => void
  /** Reemplaza las actividades del año gravable con las del Excel cargado. */
  loadActivities: (municipalityId: string, fiscalYear: number, rates: Rate[], file: string) => void
  saveUser: (user: User) => void
  toggleUser: (id: string) => void
  /** Borra el usuario de la demo. Lo que hizo queda con su nombre, que se guarda como texto. */
  removeUser: (id: string) => void
  toggleMunicipality: (id: string) => void
  /**
   * Activa el RIT o un impuesto del municipio. Si nunca se había activado, guarda la fecha de salida a producción, que ya
   * no cambia; si ya la tenía, la conserva e ignora la que llega.
   */
  enableForm: (municipalityId: string, form: Form, date: string) => void
  /**
   * Activa o desactiva un impuesto del municipio; puede quedar sin ninguno activo. Para activar uno que nunca se ha
   * activado, activarFormulario, que pide la fecha de salida a producción.
   */
  toggleTax: (municipalityId: string, tax: Tax) => void
  /** Lo mismo con el RIT. */
  toggleRit: (municipalityId: string) => void
  /** Activa o desactiva la validación contra el RIT de un formulario del municipio. */
  toggleRitValidation: (municipalityId: string, tax: Tax) => void
  /** Activa o desactiva la aprobación previa de un formulario; aplica a lo que se radique desde entonces. */
  togglePriorApproval: (municipalityId: string, tax: Tax) => void
  /** Habilita o quita la carga del Asobancaria 2001 en el municipio, para todos sus pagos con código de barras. */
  toggleAsobancariaUpload: (municipalityId: string) => void
  /** Habilita o quita el pago en efectivo en la ventanilla para un formulario del municipio. */
  toggleCashPayment: (municipalityId: string, tax: Tax) => void
  /** Registra un pago en efectivo recibido hoy en la ventanilla del municipio: el total o parte del saldo. */
  recordTellerPayment: (declarationId: string, value: number, receipt: string) => void
  /** Habilita o quita los cheques de gerencia en la ventanilla para un formulario del municipio. */
  toggleCheckPayment: (municipalityId: string, tax: Tax) => void
  /** Recibe hoy un cheque de gerencia en la ventanilla; queda en canje hasta que el banco responda. */
  receiveCheck: (
    declarationId: string,
    check: Pick<Check, 'value' | 'bank' | 'number' | 'receipt'>,
  ) => void
  /** El banco pagó el cheque: se vuelve un pago con la fecha en que se recibió. */
  confirmCheck: (id: string) => void
  /** El banco devolvió el cheque: no hay pago y la declaración vuelve a tener saldo. */
  returnCheck: (id: string, reason: string) => void
  resetDemo: () => void
}

export const useData = create<StoreState>()(
  persist(
    (set, get) => {
      const currentUser = () => get().users.find((u) => u.id === get().userId)
      const declarationMunicipality = (declarationId: string | undefined) =>
        get().declarations.find((d) => d.id === declarationId)?.municipalityId ?? null

      /**
       * Lo que hará el back al terminar cada endpoint, salga bien o mal: deja en la bitácora quién hizo la petición,
       * cuándo y con qué datos.
       */
      const record = (
        request: LogRequest,
        municipalityId: string | null,
        data: Record<string, unknown>,
        success = true,
      ) => {
        const u = currentUser()
        if (!u) return
        const entry: AuditLogEntry = {
          id: Math.max(0, ...get().auditLog.map((r) => r.id)) + 1,
          dateTime: now(),
          user: { id: u.id, name: fullName(u), role: u.role },
          municipalityId,
          ...request,
          data,
          success,
        }
        set((s) => ({ auditLog: [entry, ...s.auditLog] }))
      }

      const changeMunicipality = (municipalityId: string, modification: Partial<Municipality>) =>
        set((s) => ({
          municipalities: s.municipalities.map((m) =>
            m.id === municipalityId ? { ...m, ...modification } : m,
          ),
        }))

      /** Activa o desactiva un módulo del municipio. La bitácora guarda el valor nuevo, no un "alternar". */
      const toggleModule = (
        municipalityId: string,
        module: 'isActive' | 'rit' | 'asobancariaUpload',
      ) => {
        const m = get().municipalities.find((x) => x.id === municipalityId)
        if (!m) return
        changeMunicipality(municipalityId, { [module]: !m[module] })
        record(
          module === 'isActive' ? REQUESTS.changeMunicipalityStatus : REQUESTS.changeModule,
          municipalityId,
          { municipalityId, [module]: !m[module] },
        )
      }

      /**
       * Lo mismo, para lo que se activa por formulario. Un municipio puede quedar sin ningún impuesto activo: uno recién
       * agregado, o uno al que hubo que desactivarle todo.
       */
      const toggleModuleByTax = (municipalityId: string, module: ModuleByTax, tax: Tax) => {
        const m = get().municipalities.find((x) => x.id === municipalityId)
        if (!m) return
        const value = !m[module][tax]
        changeMunicipality(municipalityId, { [module]: { ...m[module], [tax]: value } })
        record(REQUESTS.changeModule, municipalityId, {
          municipalityId,
          [module]: { [tax]: value },
        })
      }

      return {
        ...generateData(),
        userId: null,
        selectedMunicipality: null,
        dateQueries: {},

        logIn: (userId) => {
          set({ userId, selectedMunicipality: null, dateQueries: {} })
          const u = currentUser()
          if (u) record(REQUESTS.logIn, u.municipalityId, { email: u.email })
        },
        logOut: () => set({ userId: null }),
        selectMunicipality: (id) => set({ selectedMunicipality: id }),
        setDateQuery: (page, query) =>
          set((s) => ({ dateQueries: { ...s.dateQueries, [page]: query } })),

        resolveRitChange: (registrationId, ritChangeId, status, observation, documents) => {
          const user = currentUser()
          const reviewer = user && fullName(user)
          set((s) => ({
            registrations: s.registrations.map((reg) => {
              if (reg.id !== registrationId) return reg
              const ritChange = reg.ritChanges.find((n) => n.id === ritChangeId)
              if (!ritChange) return reg
              const ritChanges = reg.ritChanges.map((n) =>
                n.id === ritChangeId
                  ? {
                      ...n,
                      status,
                      observation: observation || undefined,
                      replyDocuments: documents.length > 0 ? documents : undefined,
                      reviewedBy: reviewer,
                      reviewDate: today(),
                    }
                  : n,
              )
              let { status: registrationStatus, capacities } = reg
              if (status === 'approved') {
                if (ritChange.kind === 'registration') registrationStatus = 'active'
                if (ritChange.kind === 'cancellation') registrationStatus = 'cancelled'
                if (ritChange.kind === 'update' && ritChange.capacity) {
                  const act = /\(([^)]+)\)/.exec(ritChange.description)?.[1]
                  capacities = [...capacities, { capacity: ritChange.capacity, from: today(), act }]
                }
              } else if (ritChange.kind === 'registration') {
                registrationStatus = 'rejected'
              }
              return { ...reg, ritChanges, status: registrationStatus, capacities }
            }),
          }))
          // De los archivos, el back guarda el nombre.
          record(
            REQUESTS.resolveRitChange,
            get().registrations.find((i) => i.id === registrationId)?.municipalityId ?? null,
            {
              registrationId,
              ritChangeId,
              status,
              observation,
              documents: documents.map((d) => d.name),
            },
          )
        },

        resolveApproval: (id, resolution, observation, documents) => {
          const user = currentUser()
          const approval: Approval = {
            ...resolution,
            date: today(),
            by: user ? fullName(user) : '',
            observation: observation || undefined,
            documents: documents.length > 0 ? documents : undefined,
          }
          set((s) => ({
            declarations: s.declarations.map((d) => (d.id === id ? { ...d, approval } : d)),
          }))
          // De los archivos, el back guarda el nombre.
          record(REQUESTS.resolveApproval, declarationMunicipality(id), {
            id,
            ...resolution,
            observation,
            documents: documents.map((d) => d.name),
          })
        },

        resolveCorrection: (id, status, observation) => {
          const user = currentUser()
          const d = get().declarations.find((x) => x.id === id)
          const success = d !== undefined && correctionToResolve(correctionSituation(d, today()))
          if (d?.correctionApplication && success) {
            const { reason } = d.correctionApplication
            const resolved = {
              status,
              reason,
              date: today(),
              by: user ? fullName(user) : '',
              observation: observation || undefined,
            }
            set((s) => ({
              declarations: s.declarations.map((x) =>
                x.id === id ? { ...x, correctionApplication: resolved } : x,
              ),
            }))
          }
          record(
            REQUESTS.resolveCorrection,
            declarationMunicipality(id),
            { id, status, observation },
            success,
          )
        },

        recordSummonses: (newOnes) => {
          if (newOnes.length === 0) return
          const user = currentUser()
          const recordedBy = user ? fullName(user) : ''
          const nextOne = Math.max(0, ...get().summonses.map((e) => Number(e.id.slice(2)))) + 1
          const recordedOnes: Summons[] = newOnes.map((e, i) => ({
            ...e,
            id: `em${nextOne + i}`,
            recordedBy,
            recordDate: today(),
          }))
          set((s) => ({ summonses: [...s.summonses, ...recordedOnes] }))
          // Un lote es una sola petición.
          record(REQUESTS.recordSummonses, newOnes[0].municipalityId, {
            summonses: newOnes.map(sentData),
          })
        },

        removeSummons: (id) => {
          const e = get().summonses.find((x) => x.id === id)
          const success = e !== undefined && canBeRemoved(e, get().declarations)
          if (success) set((s) => ({ summonses: s.summonses.filter((x) => x.id !== id) }))
          record(REQUESTS.removeSummons, e?.municipalityId ?? null, { id }, success)
        },

        saveSettings: (config) => {
          set((s) => ({
            settingsList: s.settingsList.map((c) =>
              c.municipalityId === config.municipalityId ? config : c,
            ),
          }))
          record(REQUESTS.saveSettings, config.municipalityId, { ...config })
        },

        loadActivities: (municipalityId, fiscalYear, rates, file) => {
          const user = currentUser()
          const upload = {
            municipalityId,
            fiscalYear,
            rates,
            file,
            uploadedBy: user ? fullName(user) : '',
            uploadDate: today(),
          }
          set((s) => ({
            activities: [
              ...s.activities.filter(
                (a) => a.municipalityId !== municipalityId || a.fiscalYear !== fiscalYear,
              ),
              upload,
            ],
          }))
          record(REQUESTS.loadActivities, municipalityId, {
            municipalityId,
            fiscalYear,
            file,
            rates,
          })
        },

        saveUser: (user) => {
          const exists = get().users.some((u) => u.id === user.id)
          set((s) => ({
            users: exists ? s.users.map((u) => (u.id === user.id ? user : u)) : [...s.users, user],
          }))
          record(exists ? REQUESTS.editUser : REQUESTS.createUser, user.municipalityId, { ...user })
        },

        toggleUser: (id) => {
          const u = get().users.find((x) => x.id === id)
          if (!u) return
          set((s) => ({
            users: s.users.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x)),
          }))
          record(REQUESTS.changeUserStatus, u.municipalityId, { id, isActive: !u.isActive })
        },
        removeUser: (id) => {
          const municipalityId = get().users.find((u) => u.id === id)?.municipalityId ?? null
          set((s) => ({ users: s.users.filter((u) => u.id !== id) }))
          record(REQUESTS.removeUser, municipalityId, { id })
        },
        toggleMunicipality: (id) => toggleModule(id, 'isActive'),
        enableForm: (municipalityId, form, date) => {
          const m = get().municipalities.find((x) => x.id === municipalityId)
          if (!m) return
          const isActive = form === 'rit' ? { rit: true } : { taxes: { ...m.taxes, [form]: true } }
          // La fecha de salida a producción se pone una sola vez.
          const newItem = m.inProductionSince[form] ? {} : { inProductionSince: { [form]: date } }
          changeMunicipality(municipalityId, {
            ...isActive,
            inProductionSince: { [form]: date, ...m.inProductionSince },
          })
          record(REQUESTS.changeModule, municipalityId, {
            municipalityId,
            ...(form === 'rit' ? { rit: true } : { taxes: { [form]: true } }),
            ...newItem,
          })
        },
        toggleTax: (municipalityId, tax) => toggleModuleByTax(municipalityId, 'taxes', tax),
        toggleRit: (municipalityId) => toggleModule(municipalityId, 'rit'),
        toggleRitValidation: (municipalityId, tax) =>
          toggleModuleByTax(municipalityId, 'validateAgainstRit', tax),
        togglePriorApproval: (municipalityId, tax) =>
          toggleModuleByTax(municipalityId, 'priorApproval', tax),
        toggleAsobancariaUpload: (municipalityId) =>
          toggleModule(municipalityId, 'asobancariaUpload'),
        toggleCashPayment: (municipalityId, tax) =>
          toggleModuleByTax(municipalityId, 'cashPayment', tax),

        recordTellerPayment: (declarationId, value, receipt) => {
          const user = currentUser()
          set((s) => ({
            payments: [
              ...s.payments,
              {
                id: `p${s.payments.length + 1}`,
                declarationId,
                date: today(),
                value,
                method: 'Ventanilla del municipio',
                receipt,
                recordedBy: user ? fullName(user) : undefined,
              },
            ],
          }))
          record(REQUESTS.recordTellerPayment, declarationMunicipality(declarationId), {
            declarationId,
            value,
            receipt,
          })
        },

        toggleCheckPayment: (municipalityId, tax) =>
          toggleModuleByTax(municipalityId, 'checkPayment', tax),

        receiveCheck: (declarationId, check) => {
          const user = currentUser()
          set((s) => ({
            checks: [
              ...s.checks,
              {
                ...check,
                id: `ch${s.checks.length + 1}`,
                declarationId,
                receiptDate: today(),
                receivedBy: user ? fullName(user) : '',
                status: 'in_clearing',
              },
            ],
          }))
          record(REQUESTS.receiveCheck, declarationMunicipality(declarationId), {
            declarationId,
            ...check,
          })
        },

        // Un cheque que ya no está en canje no se puede confirmar ni devolver: la petición falla.
        confirmCheck: (id) => {
          const user = currentUser()
          const c = get().checks.find((x) => x.id === id)
          const success = c?.status === 'in_clearing'
          if (c && success) {
            set((s) => ({
              checks: s.checks.map((x) =>
                x.id === id
                  ? {
                      ...x,
                      status: 'paid',
                      resolutionDate: today(),
                      resolvedBy: user ? fullName(user) : '',
                    }
                  : x,
              ),
              payments: [
                ...s.payments,
                {
                  id: `p${s.payments.length + 1}`,
                  declarationId: c.declarationId,
                  date: c.receiptDate,
                  value: c.value,
                  method: 'Cheque de gerencia',
                  receipt: c.receipt,
                  recordedBy: c.receivedBy,
                },
              ],
            }))
          }
          record(REQUESTS.confirmCheck, declarationMunicipality(c?.declarationId), { id }, success)
        },

        returnCheck: (id, reason) => {
          const user = currentUser()
          const c = get().checks.find((x) => x.id === id)
          const success = c?.status === 'in_clearing'
          if (success) {
            set((s) => ({
              checks: s.checks.map((x) =>
                x.id === id
                  ? {
                      ...x,
                      status: 'returned',
                      resolutionDate: today(),
                      resolvedBy: user ? fullName(user) : '',
                      returnReason: reason,
                    }
                  : x,
              ),
            }))
          }
          record(
            REQUESTS.returnCheck,
            declarationMunicipality(c?.declarationId),
            { id, reason },
            success,
          )
        },

        resetDemo: () => set({ ...generateData(), selectedMunicipality: null, dateQueries: {} }),
      }
    },
    { name: 'gestor-pagos-demo', version: 49 },
  ),
)
