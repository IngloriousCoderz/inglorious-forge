import { DataGrid, getEditedRows } from "@inglorious/ui/data-grid"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** An EditableTable's column types, as DataGrid's. */
const CELL_TYPES = {
  text: "string",
  number: "number",
  "date-single": "date",
  url: "url",
}

const NO_EDITS = {}

/** Where a row's id goes: apart from its columns, so none can clash with it. */
const ROW_KEY = "__openuiRowId"

export const EditableTable = defineComponent({
  name: "EditableTable",
  description:
    'A table whose cells the user edits, then saves or resets: EditableTable("prices", [{type: "text", key: "item", header: "Item"}, {type: "number", key: "price", header: "Price"}], [{id: "1", values: ["Coffee", 3.5]}]). A column\'s type is text, number, date-single, url or select, which also takes options: [{value, label}]. A row\'s values follow the columns\' order. Saving sends the rows to the assistant under the table\'s name.',
  props: z.object({
    name: z.string(),
    columns: z.array(
      z.object({
        type: z.enum(["text", "number", "date-single", "select", "url"]),
        key: z.string(),
        header: z.string(),
        width: z.number().optional(),
        options: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      }),
    ),
    data: z.array(
      z.object({
        id: z.string(),
        values: z.array(z.union([z.string(), z.number()])),
      }),
    ),
  }),
  component: ({
    props,
    isStreaming,
    stateField,
    viewState,
    triggerAction,
    statementId,
  }) => {
    const columns = (props.columns ?? []).filter(Boolean)
    const saved = stateField(props.name)
    const baseline = saved.value?.[props.name] ?? props.data ?? []
    const draft = viewState(`${statementId ?? props.name}:edits`, NO_EDITS)
    const grid = {
      rowId: ROW_KEY,
      rows: baseline.map((row) => toGridRow(row, columns)),
      edits: draft.value,
    }

    return DataGrid.renderDataGrid({
      ...grid,
      columns: columns.map((column) => ({
        id: column.key,
        title: column.header,
        type: CELL_TYPES[column.type] ?? "string",
        options: column.options,
        width: column.width ?? "auto",
        isEditable: !isStreaming,
      })),
      saveLabel: "Save Changes",
      onCellChange: (payload) => {
        const copy = { ...grid, edits: structuredClone(grid.edits) }
        DataGrid.cellChange(copy, payload)
        draft.setValue(copy.edits)
      },
      onEditsReset: () => draft.setValue(NO_EDITS),
      onEditsSave: () => {
        const rows = getEditedRows(grid).map((row) => fromGridRow(row, columns))
        saved.setValue({ [props.name]: rows })
        draft.setValue(NO_EDITS)
        triggerAction("Save Changes", props.name)
      },
    })
  },
})

/** A row as OpenUI writes it, `{ id, values }`, as a DataGrid row. */
function toGridRow({ id, values = [] }, columns) {
  return Object.fromEntries([
    [ROW_KEY, id],
    ...columns.map((column, index) => [column.key, values[index]]),
  ])
}

/** A DataGrid row back as OpenUI writes it, its values in column order. */
function fromGridRow(row, columns) {
  return {
    id: row[ROW_KEY],
    values: columns.map((column) => row[column.key]),
  }
}
