import { fsm } from "@inglorious/store/fsm"

import { summarize } from "../domain/sale.js"
import { base, states } from "./handlers.js"
import * as template from "./template.js"

/**
 * A type is a list of behaviours composed left to right. `fsm` is a Decorator: a
 * function that takes the type built so far and wraps its handlers in a state machine.
 */
export const Sale = [
  base,
  fsm(states),
  {
    render(entity, api) {
      const { id } = entity
      const { products } = api.getEntity("catalog")
      const { policies, policyId } = api.getEntity("pricing")
      const summary =
        entity.receipt ?? summarize(entity, products, policies[policyId])

      return template.render({
        ...entity,
        products,
        summary,
        onItemEnter: (itemId) => api.notify(`#${id}:itemEnter`, itemId),
        onLineRemove: (itemId) => api.notify(`#${id}:lineRemove`, itemId),
        onEnd: () => api.notify(`#${id}:end`),
        onPay: (amount) => api.notify(`#${id}:pay`, amount),
        onReopen: () => api.notify(`#${id}:reopen`),
      })
    },
  },
]
