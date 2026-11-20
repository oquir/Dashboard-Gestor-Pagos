import { useEffect, useState } from 'react'
import { clearDraft, loadDraft } from '../../lib'
import { useFormStore } from '../../store'
import type { DraftRecovery, DraftRecoveryStatus } from '../../types'
import type { DraftLoad } from '../../types'
import { NOTHING_PENDING } from './useDraftRecovery.constants'
import type { PendingDraft } from './useDraftRecovery.types'

// Corre antes del asistente: si hay borrador guardado, ofrece recuperarlo.
export function useDraftRecovery(): DraftRecovery {
  const restoreDraft = useFormStore((state) => state.restoreDraft)
  // null: todavia no se miro (si no, el asistente asomaria un instante).
  const [pending, setPending] = useState<PendingDraft | null>(null)

  useEffect(() => {
    const result: DraftLoad = loadDraft()

    // Un borrador invalido se borra en el acto y nunca llega al store (solo restoreDraft escribe, y
    // exige status ok).
    if (result.status === 'invalid') {
      clearDraft()
      // eslint-disable-next-line react-hooks/set-state-in-effect -- el borrador se lee de localStorage al montar
      setPending({ draft: null, renamed: [], wasInvalid: true })
      return
    }

    if (result.status === 'empty') {
      setPending(NOTHING_PENDING)
      return
    }

    setPending({ draft: result.draft, renamed: result.renamed, wasInvalid: false })
  }, [])

  const status: DraftRecoveryStatus =
    pending === null ? 'loading' : pending.draft ? 'recovering' : 'ready'

  function restore(): void {
    if (pending?.draft) restoreDraft(pending.draft)
    setPending(NOTHING_PENDING)
  }

  function discard(): void {
    clearDraft()
    setPending(NOTHING_PENDING)
  }

  return {
    status,
    draft: pending?.draft ?? null,
    renamed: pending?.renamed ?? [],
    wasInvalid: pending?.wasInvalid ?? false,
    restore,
    discard,
  }
}
