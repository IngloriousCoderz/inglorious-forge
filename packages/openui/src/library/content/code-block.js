import { html } from "@inglorious/web"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const CodeBlock = defineComponent({
  name: "CodeBlock",
  description:
    'Code, kept exactly as written: CodeBlock("js", "const total = a + b")',
  props: z.object({
    language: z.string(),
    codeString: z.string(),
  }),
  component: ({ props }) =>
    html`<pre
      data-language=${props.language}
      style="margin: 0; padding: var(--iw-space-3); overflow: auto; border-radius: var(--iw-radius-md); background: var(--iw-color-bg-secondary); font-family: var(--iw-font-family-mono); font-size: var(--iw-font-size-sm);"
    ><code class=${`language-${props.language}`}>${props.codeString}</code></pre>`,
})
