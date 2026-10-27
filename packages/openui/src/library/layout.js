import { Accordion as UiAccordion } from "@inglorious/ui/accordion"
import { Dialog } from "@inglorious/ui/dialog"
import { Divider } from "@inglorious/ui/divider"
import { Flex } from "@inglorious/ui/flex"
import { Stepper } from "@inglorious/ui/stepper"
import { Tabs as UiTabs } from "@inglorious/ui/tabs"
import { nothing } from "@inglorious/web"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../reactive.js"

/** No step is current: Steps is a guide, not a progress tracker. */
const NO_ACTIVE_STEP = -1

/** OpenUI's gap scale, in Flex's names. */
const GAPS = {
  none: "none",
  xs: "xs",
  s: "sm",
  m: "md",
  l: "lg",
  xl: "xl",
  "2xl": "2xl",
}

export const flexProps = {
  direction: z.enum(["row", "column"]).optional(),
  gap: z.enum(["none", "xs", "s", "m", "l", "xl", "2xl"]).optional(),
  align: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
  justify: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional(),
  wrap: z.boolean().optional(),
}

/** Flex props from the OpenUI ones, with a column and a medium gap by default. */
export function toFlex({ direction, gap, align, justify, wrap }) {
  return {
    direction: direction ?? "column",
    gap: GAPS[gap ?? "m"],
    align,
    justify,
    wrap: wrap ? "wrap" : "nowrap",
  }
}

export const Stack = defineComponent({
  name: "Stack",
  description:
    'Lays its children out in a column (default) or a row. For a grid, use direction "row" with wrap true.',
  props: z.object({ children: z.array(z.any()), ...flexProps }),
  component: ({ props, renderNode }) =>
    Flex.render({ ...toFlex(props), children: renderNode(props.children) }),
})

export const Separator = defineComponent({
  name: "Separator",
  description: "A line dividing content sections",
  props: z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    decorative: z.boolean().optional(),
  }),
  component: ({ props }) =>
    Divider.render({
      orientation: props.orientation,
      isDecorative: props.decorative,
    }),
})

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

export const StepsItem = defineComponent({
  name: "StepsItem",
  description: "One step: its title and details",
  props: z.object({ title: z.string(), details: z.string().optional() }),
  component: () => null,
})

export const Steps = defineComponent({
  name: "Steps",
  description: "A step-by-step guide, in order",
  props: z.object({ items: z.array(StepsItem.ref) }),
  component: ({ props }) =>
    Stepper.render({
      orientation: "vertical",
      activeStep: NO_ACTIVE_STEP,
      steps: (props.items ?? []).filter(Boolean).map((item) => ({
        label: item.props.title,
        optional: item.props.details,
      })),
    }),
})

export const Modal = defineComponent({
  name: "Modal",
  description:
    'A dialog over the page, shown while open is true: Modal("Edit", $editing, [form]). Esc or the close button set it back to false.',
  props: z.object({
    title: z.string(),
    open: reactive(z.boolean().optional()),
    children: z.array(z.any()),
    size: z.enum(["sm", "md", "lg"]).optional(),
  }),
  component: ({ props, renderNode, stateField, statementId }) => {
    const open = stateField(`${statementId ?? "modal"}:open`, props.open)
    return Dialog.render({
      title: props.title,
      size: props.size,
      isOpen: Boolean(open.value),
      onClose: () => open.setValue(false),
      children: Flex.render({
        direction: "column",
        gap: "md",
        children: renderNode(props.children),
      }),
    })
  },
})
