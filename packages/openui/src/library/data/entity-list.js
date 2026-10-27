import { Divider } from "@inglorious/ui/divider"
import { Flex } from "@inglorious/ui/flex"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** The weight of an EntityList's header and footer rows. */
const HEAVY = 600

const entityRow = z.object({
  left: z.string(),
  right: z.string(),
  rightVariant: z.enum(["text", "number"]).optional(),
})

export const EntityList = defineComponent({
  name: "EntityList",
  description:
    'Two-column rows of a label and its value, such as a summary: EntityList([{left: "Subtotal", right: "€40", rightVariant: "number"}]). size "default" also takes a header and a footer row, such as a total.',
  props: z.object({
    rows: z.array(entityRow),
    size: z.enum(["small", "default"]).optional(),
    header: entityRow.optional(),
    footer: entityRow.optional(),
  }),
  component: ({ props }) => {
    const variant = props.size === "small" ? "caption" : "body"
    const renderRow = (row, weight) =>
      Flex.render({
        direction: "row",
        justify: "between",
        gap: "md",
        children: [
          Typography.render({ variant, weight, children: row.left }),
          Typography.render({
            variant,
            weight,
            children: when(
              row.rightVariant === "number",
              () =>
                html`<span style="font-variant-numeric: tabular-nums;"
                  >${row.right}</span
                >`,
              () => row.right,
            ),
          }),
        ],
      })
    const hasEnds = props.size !== "small"

    return Flex.render({
      direction: "column",
      gap: "sm",
      children: [
        when(hasEnds && props.header, () => [
          renderRow(props.header, HEAVY),
          Divider.render({ isDecorative: true }),
        ]),
        ...(props.rows ?? []).filter(Boolean).map((row) => renderRow(row)),
        when(hasEnds && props.footer, () => [
          Divider.render({ isDecorative: true }),
          renderRow(props.footer, HEAVY),
        ]),
      ],
    })
  },
})
