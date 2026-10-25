import { afterEach, beforeEach, expect, it, vi } from "vitest"

import { taxCalculators } from "./tax-calculators.js"

const lines = [
  { id: "100", price: 1490, quantity: 2, subtotal: 2980, taxCategory: "food" },
  {
    id: "200",
    price: 3900,
    quantity: 1,
    subtotal: 3900,
    taxCategory: "general",
  },
]

// 4% of $29.80 plus 10% of $39.00.
const EXPECTED_TAX = 119 + 390

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it.each(Object.keys(taxCalculators))(
  "%s adapts its vendor to the same contract",
  async (name) => {
    const tax = taxCalculators[name](lines)
    await vi.runAllTimersAsync()

    expect(await tax).toBe(EXPECTED_TAX)
  },
)
