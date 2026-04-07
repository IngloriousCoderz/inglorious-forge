import { html } from "@inglorious/web"
import { Form } from "@inglorious/web/form"

import { createInvoiceLineItem } from "../store/entities"
import { render as renderActionsSection } from "./actions"
import { render as renderDetailsSection } from "./details"
import { render as renderHeroSection } from "./hero"
import { render as renderLineItemsSection } from "./line-items"
import { clone, formatMoney, summarizeLineItems } from "./utils"
import { validateInvoiceForm } from "./validation"

export const InvoiceForm = {
  ...Form,

  submit(entity) {
    if (!entity.isValid) {
      console.error("Invoice form is not valid:", clone(entity.errors))
      return
    }

    const totals = summarizeLineItems(entity.values.lineItems)

    alert(
      `Invoice ${entity.values.invoiceNumber} for ${entity.values.customer} is ready. ` +
        `${entity.values.lineItems.length} rows, total ${formatMoney(totals.grandTotal)}.`,
    )
  },

  render(entity, api) {
    const { lineItems } = entity.values
    const totals = summarizeLineItems(lineItems)

    return html`<form
      class="invoice-form"
      @submit=${() => {
        api.notify("#form:validate", { validate: validateInvoiceForm })
        api.notify("#form:submit")
      }}
    >
      ${renderHeroSection({
        rowCount: lineItems.length,
        grandTotal: totals.grandTotal,
      })}
      ${renderDetailsSection(entity, api)}
      ${renderLineItemsSection(
        {
          ...entity,
          totals,
          onAddRow: () =>
            api.notify("#form:fieldArrayAppend", {
              path: "lineItems",
              value: createInvoiceLineItem(lineItems.length),
            }),
        },
        api,
      )}
      ${renderActionsSection(entity, api)}
    </form>`
  },
}
