import { Button as UiButton } from "@inglorious/ui/button"
import { Divider } from "@inglorious/ui/divider"
import { Flex } from "@inglorious/ui/flex"
import { List as UiList } from "@inglorious/ui/list"
import { Table as UiTable } from "@inglorious/ui/table"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { action, defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

const NO_ROWS = 0
/** The weight of an EntityList's header and footer rows. */
const HEAVY = 600

export const Col = defineComponent({
  name: "Col",
  description:
    "A table column: its label and its data, one value or component per row",
  props: z.object({
    label: z.string(),
    data: z.any(),
    type: z.enum(["string", "number", "action"]).optional(),
  }),
  // Rendered by its Table, a cell at a time.
  component: () => null,
})

export const Table = defineComponent({
  name: "Table",
  description:
    'A table built column by column: Table([Col("Name", names), Col("Total", totals, "number")])',
  props: z.object({ columns: z.array(Col.ref) }),
  component: ({ props, renderNode }) => {
    const columns = (props.columns ?? []).filter(Boolean)
    const cells = columns.map((column) =>
      Array.isArray(column.props.data) ? column.props.data : [],
    )
    const rowCount = Math.max(NO_ROWS, ...cells.map((data) => data.length))

    return UiTable.render({
      isFullWidth: true,
      columns: columns.map((column, index) => ({
        id: `${index}`,
        label: column.props.label,
        align: column.props.type === "number" ? "right" : "left",
      })),
      rows: Array.from({ length: rowCount }, (_, rowIndex) =>
        Object.fromEntries(
          cells.map((data, index) => [`${index}`, renderNode(data[rowIndex])]),
        ),
      ),
    })
  },
})

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
  // Rendered by its ListBlock.
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
