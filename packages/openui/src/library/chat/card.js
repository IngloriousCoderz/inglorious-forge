import { Card as UiCard } from "@inglorious/ui/card"
import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** Only web links: a model-written `javascript:` URL must not run. */
const WEB_URL = /^https?:\/\//i

const source = z.object({
  title: z.string(),
  sourceName: z.string(),
  url: z.string().optional(),
})

export const ChatCard = defineComponent({
  name: "Card",
  description:
    "The answer: everything in it stacks top to bottom. sources, [{title, sourceName, url}], are listed at the bottom and cited in TextContent as [1], [2].",
  props: z.object({
    children: z.array(z.any()),
    sources: z.array(source).optional(),
  }),
  component: ({ props, renderNode }) => {
    const sources = (props.sources ?? []).filter(Boolean)
    return UiCard.render({
      children: Flex.render({
        direction: "column",
        gap: "md",
        children: [
          renderNode(props.children, { sources }),
          when(sources.length, () => renderSources(sources)),
        ],
      }),
    })
  },
})

function renderSources(sources) {
  return html`<footer>
    ${Typography.render({ variant: "overline", children: "Sources" })}
    <ol style="margin: 0; padding-inline-start: var(--iw-space-5);">
      ${sources.map(
        ({ title, sourceName, url }) =>
          html`<li>
            ${Typography.render({
              variant: "caption",
              children: when(
                url && WEB_URL.test(url),
                () =>
                  html`<a href=${url} target="_blank" rel="noopener noreferrer"
                      >${title}</a
                    >
                    · ${sourceName}`,
                () => `${title} · ${sourceName}`,
              ),
            })}
          </li>`,
      )}
    </ol>
  </footer>`
}
