import { Button as UiButton } from "@inglorious/ui/button"
import { action, defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

import { Icon } from "../content/icon.js"
import { SIZES, VARIANTS } from "./button.js"

export const IconButton = defineComponent({
  name: "IconButton",
  description:
    'A button showing only an Icon: IconButton("Delete", Icon("trash"), @Run(remove)). name labels it for screen readers and is the message sent when there is no action.',
  props: z.object({
    name: z.string(),
    icon: Icon.ref,
    action: action().optional(),
    variant: z.enum(["primary", "secondary", "tertiary"]).optional(),
    size: z.enum(["extra-small", "small", "medium", "large"]).optional(),
    shape: z.enum(["square", "circle"]).optional(),
  }),
  component: ({ props, isStreaming, triggerAction, renderNode }) =>
    UiButton.render({
      children: renderNode(props.icon),
      ariaLabel: props.name,
      variant: VARIANTS[props.variant ?? "secondary"],
      size: SIZES[props.size ?? "medium"],
      shape: props.shape === "circle" ? "round" : "square",
      isDisabled: isStreaming,
      onClick: () => triggerAction(props.name, undefined, props.action),
    }),
})
