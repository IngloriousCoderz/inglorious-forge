import { Button as UiButton } from "@inglorious/ui/button"
import { List as UiList } from "@inglorious/ui/list"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { action, defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

export const ListItem = defineComponent({
  name: "ListItem",
  description:
    "One item of a ListBlock: a title, an optional subtitle and image, and an optional action behind a button labelled actionLabel",
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    image: z.object({ src: z.string(), alt: z.string() }).optional(),
    actionLabel: z.string().optional(),
    action: action().optional(),
  }),
  component: () => null,
})

export const ListBlock = defineComponent({
  name: "ListBlock",
  description:
    'A list of ListItems, numbered (default) or with each item\'s "image". size "small" is compact.',
  props: z.object({
    items: z.array(ListItem.ref),
    variant: z.enum(["number", "image"]).optional(),
    size: z.enum(["default", "small"]).optional(),
  }),
  component: ({ props, isStreaming, triggerAction }) => {
    const hasImages = props.variant === "image"
    return UiList.render({
      isOrdered: !hasImages,
      isDense: props.size === "small",
      items: (props.items ?? []).filter(Boolean).map(({ props: item }) => ({
        primary: item.title,
        secondary: item.subtitle,
        icon: when(
          hasImages && item.image,
          () =>
            html`<img
              src=${item.image.src}
              alt=${item.image.alt}
              style="inline-size: 2.5rem; block-size: 2.5rem; object-fit: cover; border-radius: var(--iw-radius-sm);"
            />`,
        ),
        action: when(item.action, () =>
          UiButton.render({
            children: item.actionLabel ?? "Open",
            variant: "ghost",
            size: "sm",
            isDisabled: isStreaming,
            onClick: () => triggerAction(item.title, undefined, item.action),
          }),
        ),
      })),
    })
  },
})
