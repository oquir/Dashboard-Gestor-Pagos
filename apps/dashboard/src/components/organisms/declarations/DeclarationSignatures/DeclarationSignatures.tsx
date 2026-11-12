import { accountingPositionLabel, documentFormat } from '../../../../lib'
import { Card } from '../../../atoms'
import { CardHeader, DataItem } from '../../../molecules'
import type { DeclarationSignaturesProps } from './DeclarationSignatures.types'

/** Quien diligenció la declaración y el contador o revisor fiscal; no lo tiene quien no está obligado a llevar contabilidad. */
export default function DeclarationSignatures({ d }: DeclarationSignaturesProps) {
  const { filer: dec, accountant: c } = d

  return (
    <Card>
      <CardHeader
        title="Firmas"
        description="Quien diligenció la declaración y el contador o revisor fiscal."
      />
      <dl className="space-y-4 p-5">
        <DataItem label="Declarante">
          {dec.name}
          <span className="block text-xs tabular-nums text-fg-muted">{documentFormat(dec)}</span>
        </DataItem>
        <DataItem label={c ? accountingPositionLabel[c.jobTitle] : 'Contador o revisor fiscal'}>
          {c ? (
            <>
              {c.name}
              <span className="block text-xs tabular-nums text-fg-muted">
                {documentFormat(c)} · Tarjeta profesional {c.professionalCard}
              </span>
            </>
          ) : (
            <span className="text-fg-muted">No firma</span>
          )}
        </DataItem>
      </dl>
    </Card>
  )
}
