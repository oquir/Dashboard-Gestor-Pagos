import { CodeBlock } from '../../atoms'
import { CopyIconButton } from '../../atoms'
import { PanelSection } from '../PanelSection'

export function GeneratedSchemaPreview({ schema }: { schema: string }) {
  return (
    <PanelSection
      title="Esquema Zod generado"
      aside={<CopyIconButton value={schema} title="Copiar el esquema" />}
    >
      <CodeBlock>{schema}</CodeBlock>
    </PanelSection>
  )
}
