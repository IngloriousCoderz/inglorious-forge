import { Dialog } from "@inglorious/ui/dialog"
import { Flex } from "@inglorious/ui/flex"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { reactive } from "../../reactive.js"

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
