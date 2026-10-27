import { Button as UiButton } from "@inglorious/ui/button"
import { Flex } from "@inglorious/ui/flex"
import { action, ACTION_STEPS, defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const VARIANTS = {
  primary: "default",
  secondary: "outline",
  tertiary: "ghost",
}

export const SIZES = {
  "extra-small": "xs",
  small: "sm",
  medium: "md",
  large: "lg",
}

export const Button = defineComponent({
  name: "Button",
  description:
    'A button running its action when pressed. type "destructive" for actions that delete or undo.',
  props: z.object({
    label: z.string(),
    action: action().optional(),
    variant: z.enum(["primary", "secondary", "tertiary"]).optional(),
    type: z.enum(["normal", "destructive"]).optional(),
    size: z.enum(["extra-small", "small", "medium", "large"]).optional(),
  }),
  component: ({ props, isStreaming, triggerAction, validateForm }) => {
    const variant = props.variant ?? "primary"
    return UiButton.render({
      children: props.label,
      variant: VARIANTS[variant],
      color:
        props.type === "destructive"
          ? "error"
          : variant === "primary"
            ? "primary"
            : "default",
      size: SIZES[props.size ?? "medium"],
      // Until the answer is whole, an action could act on half of it.
      isDisabled: isStreaming,
      onClick: () => {
        // In a Form, the primary button checks the fields before acting on them.
        const isChecked = variant === "primary" && validateForm
        if (isChecked && sendsFields(props.action) && !validateForm()) return
        triggerAction(props.label, undefined, props.action)
      },
    })
  },
})

export const Buttons = defineComponent({
  name: "Buttons",
  description: 'A group of Buttons, in a row (default) or a "column".',
  props: z.object({
    buttons: z.array(Button.ref),
    direction: z.enum(["row", "column"]).optional(),
  }),
  component: ({ props, renderNode }) =>
    Flex.render({
      direction: props.direction ?? "row",
      gap: "sm",
      wrap: "wrap",
      children: renderNode(props.buttons),
    }),
})

/**
 * Whether an action takes the form's values somewhere: to the assistant, to
 * a mutation or to a custom action. Setting a value or opening a link does
 * not need the fields to be valid.
 */
function sendsFields(action) {
  if (!action?.steps) return true
  return action.steps.some(
    (step) =>
      step.type === ACTION_STEPS.ToAssistant ||
      step.type === "custom_action" ||
      (step.type === ACTION_STEPS.Run && step.refType === "mutation"),
  )
}
