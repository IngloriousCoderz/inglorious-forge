import { Flex } from "@inglorious/ui/flex"
import { Tabs as UiTabs } from "@inglorious/ui/tabs"
import { nothing } from "@inglorious/web"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const TabItem = defineComponent({
  name: "TabItem",
  description: "One tab: a unique value, its label and its content",
  props: z.object({
    value: z.string(),
    trigger: z.string(),
    content: z.array(z.any()),
  }),
  // Rendered by its Tabs.
  component: () => null,
})

export const Tabs = defineComponent({
  name: "Tabs",
  description:
    "Alternative views of the same subject, one at a time, such as a chart and a table",
  props: z.object({ items: z.array(TabItem.ref) }),
  component: ({ props, renderNode, viewState, statementId }) => {
    const items = (props.items ?? []).filter(Boolean).map((item) => item.props)
    if (!items.length) return nothing

    // Which tab is open is the screen's business, not the user's input.
    const [first] = items
    const tab = viewState(`${statementId ?? "tabs"}:tab`, first.value)
    return UiTabs.render({
      value: tab.value,
      onChange: tab.setValue,
      items: items.map((item) => ({
        value: item.value,
        label: item.trigger,
        panel: Flex.render({
          direction: "column",
          gap: "md",
          children: renderNode(item.content),
        }),
      })),
    })
  },
})
