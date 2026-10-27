import { Button as UiButton } from "@inglorious/ui/button"
import { Flex } from "@inglorious/ui/flex"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const FollowUpItem = defineComponent({
  name: "FollowUpItem",
  description:
    "A follow-up question: pressed, it is sent as the user's message",
  props: z.object({ text: z.string() }),
  // Rendered by its FollowUpBlock.
  component: () => null,
})

export const FollowUpBlock = defineComponent({
  name: "FollowUpBlock",
  description:
    'Follow-up questions the user may ask next, at the end of an answer: FollowUpBlock([FollowUpItem("Compare with last month")])',
  props: z.object({ items: z.array(FollowUpItem.ref) }),
  component: ({ props, isStreaming, triggerAction }) =>
    Flex.render({
      direction: "column",
      align: "start",
      gap: "xs",
      children: (props.items ?? []).filter(Boolean).map(({ props: item }) =>
        UiButton.render({
          children: `${item.text} →`,
          variant: "ghost",
          size: "sm",
          isDisabled: isStreaming,
          onClick: () => triggerAction(item.text),
        }),
      ),
    }),
})
