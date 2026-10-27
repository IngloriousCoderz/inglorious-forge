import { Table as UiTable } from "@inglorious/ui/table"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

const NO_ROWS = 0

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
