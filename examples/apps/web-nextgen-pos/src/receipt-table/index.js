import { Button } from "@inglorious/ui/button"
import { Table } from "@inglorious/ui/table"
import { html } from "@inglorious/web"

import { formatMoney } from "../domain/money.js"

/**
 * Template Method: `Table.render` fixes the skeleton of a table and leaves the
 * steps overridable. Overriding one step is an object spread, not a subclass.
 */
export const ReceiptTable = {
  ...Table,

  renderCell(props, payload) {
    const { column, row } = payload

    if (column.id === "remove") {
      return html`<td class="iw-table-cell">
        ${Button.render({
          children: "−",
          size: "sm",
          variant: "ghost",
          color: "error",
          ariaLabel: `Remove one ${row.description}`,
          onClick: () => props.onLineRemove(row.id),
        })}
      </td>`
    }

    if (column.isMoney) {
      return Table.renderCell(props, {
        ...payload,
        row: { ...row, [column.id]: formatMoney(row[column.id]) },
      })
    }

    return Table.renderCell(props, payload)
  },
}
