import { CodeBlock } from '../../atoms/CodeBlock'
import { CopyIconButton } from '../../atoms/CopyIconButton'
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
