// Money is kept in integer cents, so that adding up a receipt never drifts by a fraction.
const CENTS_PER_UNIT = 100
const ZERO = 0

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatMoney(cents) {
  return formatter.format(cents / CENTS_PER_UNIT)
}

export function sum(amounts) {
  return amounts.reduce((acc, amount) => acc + amount, ZERO)
}
