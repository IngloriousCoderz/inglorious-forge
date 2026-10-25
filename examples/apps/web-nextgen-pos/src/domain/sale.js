/**
 * Information Expert, as functions: the sale knows its lines, the catalog knows its
 * prices, and the pricing policy knows its discount. A total is worked out from the
 * three wherever it is needed, rather than being stored and kept in step.
 */

import { sum } from "./money.js"
import { discountFor } from "./pricing.js"

const NO_TAX = 0

export function lineItems(sale, products) {
  return sale.lines.map(({ itemId, quantity }) => {
    const { description, price, taxCategory } = products[itemId]

    return {
      id: itemId,
      description,
      price,
      quantity,
      taxCategory,
      subtotal: price * quantity,
    }
  })
}

export function summarize(sale, products, policy) {
  const lines = lineItems(sale, products)
  const subtotal = sum(lines.map((line) => line.subtotal))
  const discount = discountFor(policy, subtotal)
  const tax = sale.tax ?? NO_TAX

  return {
    saleId: sale.id,
    lines,
    subtotal,
    discount,
    policyLabel: policy.label,
    tax: sale.tax,
    total: subtotal - discount + tax,
  }
}

export function receiptFor(sale, products, policy, payment) {
  const summary = summarize(sale, products, policy)

  return { ...summary, payment, change: payment - summary.total }
}
