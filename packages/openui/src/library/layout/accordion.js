import { Accordion as UiAccordion } from "@inglorious/ui/accordion"
import { Flex } from "@inglorious/ui/flex"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const AccordionItem = defineComponent({
  name: "AccordionItem",
  description:
    "One collapsible section: a unique value, its title and its content",
  props: z.object({
    value: z.string(),
    trigger: z.string(),
    content: z.array(z.any()),
  }),
  component: () => null,
})

export const Accordion = defineComponent({
  name: "Accordion",
  description: "Sections that open and close, such as FAQs or details",
  props: z.object({ items: z.array(AccordionItem.ref) }),
  component: ({ props, renderNode, viewState, statementId }) => {
    const items = (props.items ?? []).filter(Boolean).map((item) => item.props)
    const open = viewState(`${statementId ?? "accordion"}:open`, [])

    return UiAccordion.render({
      items: items.map((item) => ({
        id: item.value,
        title: item.trigger,
        isExpanded: open.value.includes(item.value),
        content: Flex.render({
          direction: "column",
          gap: "md",
          children: renderNode(item.content),
        }),
      })),
      onItemToggle: (item, _, isExpanded) =>
        open.setValue(
          isExpanded
            ? [...open.value, item.id]
            : open.value.filter((value) => value !== item.id),
        ),
    })
  },
})
