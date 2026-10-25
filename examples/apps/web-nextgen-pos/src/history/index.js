import { Card } from "@inglorious/ui/card"
import { Chip } from "@inglorious/ui/chip"
import { Table } from "@inglorious/ui/table"
import { html } from "@inglorious/web"

import { formatMoney } from "../domain/money.js"
import { renderPatterns } from "../patterns/index.js"

const COLUMNS = [
  { id: "sale", label: "Sale" },
  { id: "total", label: "Total", align: "right" },
  { id: "books", label: "Books" },
]

// Larman's `Store` keeps a list of completed sales. Here the completed sales are the
// list: there is nothing to copy them into, only a question to ask of the world.
export const History = {
  render(_, api) {
    const accounting = api.getEntity("accounting")
    const sales = api
      .getEntities("Sale")
      .filter((sale) => sale.state === "complete")

    return Card.render({
      title: "Completed sales",
      subtitle: `${accounting.posted.length} posted · ${accounting.queued.length} stored locally`,
      children: sales.length
        ? Table.render({
            columns: COLUMNS,
            isFullWidth: true,
            rows: sales.map((sale) => ({
              id: sale.id,
              sale: sale.id,
              total: formatMoney(sale.receipt.total),
              books: renderStatus(accounting, sale.id),
            })),
          })
        : html`<p class="empty">No sales yet.</p>`,
      footer: renderPatterns([
        "Proxy",
        "Command",
        "Observer",
        "Pure Fabrication",
        "Protected Variations",
      ]),
    })
  },
}

function renderStatus({ posted, queued, sending }, saleId) {
  if (posted.includes(saleId)) {
    return Chip.render({ children: "Posted", size: "sm", color: "success" })
  }

  if (queued.some((receipt) => receipt.saleId === saleId)) {
    return Chip.render({
      children: "Stored locally",
      size: "sm",
      color: "warning",
    })
  }

  if (sending.includes(saleId)) {
    return Chip.render({ children: "Sending…", size: "sm" })
  }

  return null
}
