import { Alert } from "@inglorious/ui/alert"
import { Button } from "@inglorious/ui/button"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { formatMoney } from "../domain/money.js"
import { ReceiptTable } from "../receipt-table/index.js"

const TWENTY = 2000
const FIFTY = 5000
const HUNDRED = 10000
const BILLS = [TWENTY, FIFTY, HUNDRED]

const COLUMNS = [
  { id: "description", label: "Item" },
  { id: "quantity", label: "Qty", align: "right" },
  { id: "price", label: "Price", align: "right", isMoney: true },
  { id: "subtotal", label: "Subtotal", align: "right", isMoney: true },
]

const REMOVE_COLUMN = { id: "remove", label: "" }

export function render(props) {
  const { state, error } = props

  return html`<div class="sale">
    ${renderProductPad(props)}
    ${when(error, () => Alert.render({ severity: "error", description: error }))}
    ${renderLines(props)} ${renderTotals(props)} ${renderActions(props)}
    ${when(state === "complete", () => renderChange(props))}
  </div>`
}

function renderProductPad({ state, products, onItemEnter }) {
  const isOpen = state === "open"

  return html`<div class="product-pad">
    ${Object.values(products).map((product) =>
      Button.render({
        children: html`<span class="product-name">${product.description}</span>
          <span class="product-price">${formatMoney(product.price)}</span>`,
        variant: "outline",
        className: "product",
        isDisabled: !isOpen,
        onClick: () => onItemEnter(product.id),
      }),
    )}
  </div>`
}

function renderLines({ state, summary, onLineRemove }) {
  if (!summary.lines.length) {
    return html`<p class="empty">Scan an item to begin.</p>`
  }

  const isOpen = state === "open"

  return ReceiptTable.render({
    columns: isOpen ? [...COLUMNS, REMOVE_COLUMN] : COLUMNS,
    rows: summary.lines,
    isFullWidth: true,
    isStriped: true,
    onLineRemove,
  })
}

function renderTotals({ summary }) {
  const { subtotal, discount, policyLabel, tax, total } = summary

  return html`<dl class="totals">
    <dt>Subtotal</dt>
    <dd>${formatMoney(subtotal)}</dd>
    <dt>Discount <small>(${policyLabel})</small></dt>
    <dd>−${formatMoney(discount)}</dd>
    <dt>Tax</dt>
    <dd>${tax == null ? "—" : formatMoney(tax)}</dd>
    <dt class="grand">Total</dt>
    <dd class="grand">${formatMoney(total)}</dd>
  </dl>`
}

function renderActions(props) {
  const { state, summary, onEnd, onPay, onReopen } = props

  switch (state) {
    case "open":
      return html`<div class="actions">
        ${Button.render({
          children: "End sale",
          color: "primary",
          isFullWidth: true,
          isDisabled: !summary.lines.length,
          onClick: onEnd,
        })}
      </div>`

    case "totaling":
      return html`<div class="actions">
        ${Button.render({
          children: "Calculating tax…",
          isFullWidth: true,
          isDisabled: true,
        })}
      </div>`

    case "paying":
      return html`<div class="actions">
        ${tenderOptions(summary.total).map((amount) =>
          Button.render({
            children:
              amount === summary.total
                ? `Exact ${formatMoney(amount)}`
                : formatMoney(amount),
            color: "success",
            onClick: () => onPay(amount),
          }),
        )}
        ${Button.render({
          children: "Back to items",
          variant: "ghost",
          onClick: onReopen,
        })}
      </div>`

    default:
      return null
  }
}

function renderChange({ summary }) {
  return Alert.render({
    severity: "success",
    title: `Paid ${formatMoney(summary.payment)}`,
    description: `Change due: ${formatMoney(summary.change)}`,
  })
}

function tenderOptions(total) {
  return [total, ...BILLS.filter((bill) => bill > total)]
}
