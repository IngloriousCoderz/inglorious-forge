/**
 * Stand-ins for the third-party systems Larman's POS has to talk to. They are not ours
 * to change, and they disagree with each other on purpose: different method names,
 * different input shapes, different units. Nothing in the app imports them except the
 * adapters.
 */

export const LATENCY = 400

const CENTS_PER_UNIT = 100
const DECIMAL_PLACES = 2
const ZERO = 0

const TAX_MASTER_RATES = { FOOD: 0.04, GENERAL: 0.1 }

export const taxMaster = {
  async computeTaxes({ items }) {
    await wait(LATENCY)

    const totalTax = items.reduce(
      (acc, { amountCents, category }) =>
        acc + Math.round(amountCents * TAX_MASTER_RATES[category]),
      ZERO,
    )

    return { totalTax }
  },
}

const GOOD_AS_GOLD_RATES = { F: 0.04, G: 0.1 }

export const goodAsGoldTaxPro = {
  async calc(rows) {
    await wait(LATENCY)

    return rows.map(([code, quantity, unitPrice, taxClass]) => ({
      code,
      tax: (
        Number(unitPrice) *
        quantity *
        GOOD_AS_GOLD_RATES[taxClass]
      ).toFixed(DECIMAL_PLACES),
    }))
  },
}

export const accountingSystem = {
  async post(receipts, { isOnline }) {
    await wait(LATENCY)

    if (!isOnline) {
      throw new Error("Accounting system unreachable")
    }

    return receipts.map(({ saleId }) => saleId)
  },
}

export function toDecimal(cents) {
  return (cents / CENTS_PER_UNIT).toFixed(DECIMAL_PLACES)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
