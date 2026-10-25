/**
 * Larman's pricing strategies (Strategy), and the composites that pick among them
 * (Composite).
 *
 * A strategy is a plain function from `(policy, subtotal)` to a discount. The policy
 * is plain data, so it lives in the store and can be inspected, serialized and
 * replayed, while the behaviour it names lives here. Picking the behaviour by `kind`
 * is Polymorphism without a class hierarchy.
 *
 * A composite has exactly the same signature as a leaf, which is the whole of the
 * Composite pattern: whoever asks for a discount never learns which of the two it got.
 */

const PERCENT = 100
const NO_DISCOUNT = 0

export const strategies = {
  none: () => NO_DISCOUNT,

  percent: ({ percentage }, subtotal) =>
    Math.round((subtotal * percentage) / PERCENT),

  absoluteOverThreshold: ({ threshold, discount }, subtotal) =>
    subtotal >= threshold ? Math.min(discount, subtotal) : NO_DISCOUNT,

  bestForCustomer: ({ policies }, subtotal) =>
    Math.max(...policies.map((policy) => discountFor(policy, subtotal))),

  bestForStore: ({ policies }, subtotal) =>
    Math.min(...policies.map((policy) => discountFor(policy, subtotal))),
}

export function discountFor(policy, subtotal) {
  return strategies[policy.kind](policy, subtotal)
}
