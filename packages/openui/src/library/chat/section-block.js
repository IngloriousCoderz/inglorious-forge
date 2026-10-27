import { Accordion as UiAccordion } from "@inglorious/ui/accordion"
import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** Once an answer is whole, the sections left open: the first. */
const OPEN_WHEN_DONE = 1

const FIRST_SECTION = 0

export const SectionItem = defineComponent({
  name: "SectionItem",
  description:
    "One section of a SectionBlock: a unique value, its title, and its content",
  props: z.object({
    value: z.string(),
    trigger: z.string(),
    content: z.array(z.any()),
  }),
  // Rendered by its SectionBlock.
  component: () => null,
})

export const SectionBlock = defineComponent({
  name: "SectionBlock",
  description:
    "Sections that divide a long answer into topics, each opening and closing; isFoldable false shows them as plain headings instead",
  props: z.object({
    sections: z.array(SectionItem.ref),
    isFoldable: z.boolean().optional(),
  }),
  component: ({ props, renderNode, viewState, isStreaming, statementId }) => {
    const sections = (props.sections ?? [])
      .filter(Boolean)
      .map((section) => section.props)
    const renderContent = (section) =>
      Flex.render({
        direction: "column",
        gap: "md",
        children: renderNode(section.content ?? []),
      })

    if (props.isFoldable === false) {
      return Flex.render({
        direction: "column",
        gap: "lg",
        children: sections.map((section) =>
          Flex.render({
            direction: "column",
            gap: "sm",
            children: [
              Typography.render({ variant: "h3", children: section.trigger }),
              renderContent(section),
            ],
          }),
        ),
      })
    }

    // As the answer arrives every section opens, so it shows as it is
    // written; once it is whole, only the first stays open. Whatever the user
    // opens or closes from then on is theirs.
    const opened = viewState(`${statementId ?? "sections"}:open`, null)
    const open =
      opened.value ??
      (isStreaming
        ? sections.map(({ value }) => value)
        : sections
            .slice(FIRST_SECTION, OPEN_WHEN_DONE)
            .map(({ value }) => value))

    return UiAccordion.render({
      items: sections.map((section) => ({
        id: section.value,
        title: section.trigger,
        isExpanded: open.includes(section.value),
        content: renderContent(section),
      })),
      onItemToggle: (item, _, isExpanded) =>
        opened.setValue(
          isExpanded
            ? [...open, item.id]
            : open.filter((value) => value !== item.id),
        ),
    })
  },
})
