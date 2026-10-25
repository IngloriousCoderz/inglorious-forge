import { handleAsync } from "@inglorious/store/async"

import { lineItems, receiptFor } from "../domain/sale.js"
import { taxCalculators } from "../services/tax-calculators.js"

const QUANTITY_STEP = 1
const NOT_FOUND = -1
const ONE = 1
const NO_CHANGE = 0

/**
 * What a sale does whatever state it is in. `taxCalculate` reaches out to whichever
 * tax adapter the store is configured with. It has no success or error handler of its
 * own: only the `totaling` state answers those, so a reply that arrives when the sale
 * is no longer waiting for one is simply not listened to.
 */
export const base = {
  ...handleAsync("taxCalculate", {
    run({ calculator, lines }) {
      return taxCalculators[calculator](lines)
    },
  }),
}

/**
 * Larman's sale lifecycle (State). Each state names only the events it answers; an
 * event a state does not name falls through to the base type, which for every one of
 * these does nothing. Entering an item into a sale being paid for is therefore not an
 * error to be guarded against: it is an event nobody is listening to.
 */
export const states = {
  open: {
    itemEnter(entity, itemId) {
      const line = entity.lines.find((line) => line.itemId === itemId)

      if (line) {
        line.quantity += QUANTITY_STEP
        return
      }

      entity.lines.push({ itemId, quantity: QUANTITY_STEP })
    },

    lineRemove(entity, itemId) {
      const index = entity.lines.findIndex((line) => line.itemId === itemId)
      if (index === NOT_FOUND) return

      const line = entity.lines[index]
      if (line.quantity > QUANTITY_STEP) {
        line.quantity -= QUANTITY_STEP
        return
      }

      entity.lines.splice(index, ONE)
    },

    end(entity, _, api) {
      if (!entity.lines.length) return

      const { products } = api.getEntity("catalog")
      const { taxCalculator } = api.getEntity("services")

      entity.state = "totaling"
      entity.error = null

      api.notify(`#${entity.id}:taxCalculate`, {
        calculator: taxCalculator,
        lines: lineItems(entity, products),
      })
    },
  },

  totaling: {
    taxCalculateSuccess(entity, tax) {
      entity.tax = tax
      entity.state = "paying"
    },

    taxCalculateError(entity, error) {
      entity.error = error.message
      entity.state = "open"
    },
  },

  paying: {
    pay(entity, payment, api) {
      const { products } = api.getEntity("catalog")
      const { policies, policyId } = api.getEntity("pricing")
      const receipt = receiptFor(entity, products, policies[policyId], payment)

      if (receipt.change < NO_CHANGE) {
        entity.error = "The payment does not cover the total"
        return
      }

      entity.receipt = receipt
      entity.error = null
      entity.state = "complete"

      // Broadcast: the sale does not know, and should not know, who keeps the books.
      // The receipt travels with the event because it is the change being announced.
      api.notify("saleComplete", receipt)
    },

    reopen(entity) {
      entity.tax = null
      entity.error = null
      entity.state = "open"
    },
  },

  // A completed sale is a record. It answers nothing.
  complete: {},
}
