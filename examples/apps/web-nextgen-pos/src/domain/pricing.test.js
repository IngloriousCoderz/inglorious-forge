import { describe, expect, it } from "vitest"

import { discountFor } from "./pricing.js"

const tenPercentOff = { kind: "percent", percentage: 10 }
const fiveOffOverFifty = {
  kind: "absoluteOverThreshold",
  threshold: 5000,
  discount: 500,
}

describe("leaf strategies", () => {
  it("gives no discount at regular price", () => {
    expect(discountFor({ kind: "none" }, 8000)).toBe(0)
  })

  it("takes a percentage off", () => {
    expect(discountFor(tenPercentOff, 3000)).toBe(300)
  })

  it("takes a fixed amount off only over the threshold", () => {
    expect(discountFor(fiveOffOverFifty, 4999)).toBe(0)
    expect(discountFor(fiveOffOverFifty, 5000)).toBe(500)
  })
})

describe("composite strategies", () => {
  const policies = [tenPercentOff, fiveOffOverFifty]

  it("picks the largest discount for the customer", () => {
    // 10% of $60 is $6, which beats $5 off.
    expect(discountFor({ kind: "bestForCustomer", policies }, 6000)).toBe(600)
  })

  it("picks the smallest discount for the store", () => {
    expect(discountFor({ kind: "bestForStore", policies }, 6000)).toBe(500)
  })

  it("nests, because a composite is a strategy", () => {
    const nested = {
      kind: "bestForStore",
      policies: [{ kind: "bestForCustomer", policies }, tenPercentOff],
    }

    expect(discountFor(nested, 6000)).toBe(600)
  })
})
