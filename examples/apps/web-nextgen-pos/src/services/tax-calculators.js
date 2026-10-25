/**
 * Adapter and Factory.
 *
 * Each adapter is a function with one shape in (line items) and one shape out (tax in
 * cents), hiding whatever its vendor wants instead. Larman's `ITaxCalculatorAdapter`
 * interface is just that function signature.
 *
 * Larman's `ServicesFactory` reads a property to decide which adapter class to
 * instantiate, and is a Singleton so that everyone gets the same one. Here the factory
 * is this object, the property is `services.taxCalculator` in the store, and the
 * module system already hands everyone the same instance.
 */

import { sum } from "../domain/money.js"
import { goodAsGoldTaxPro, taxMaster, toDecimal } from "./vendors.js"

const CENTS_PER_UNIT = 100

export const taxCalculators = {
  async taxMaster(lines) {
    const { totalTax } = await taxMaster.computeTaxes({
      items: lines.map((line) => ({
        sku: line.id,
        amountCents: line.subtotal,
        category: line.taxCategory.toUpperCase(),
      })),
    })

    return totalTax
  },

  async goodAsGold(lines) {
    const rows = await goodAsGoldTaxPro.calc(
      lines.map((line) => [
        line.id,
        line.quantity,
        toDecimal(line.price),
        line.taxCategory === "food" ? "F" : "G",
      ]),
    )

    return sum(rows.map(({ tax }) => Math.round(Number(tax) * CENTS_PER_UNIT)))
  },
}
