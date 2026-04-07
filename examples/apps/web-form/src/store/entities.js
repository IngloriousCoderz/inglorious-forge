const UNIT_OPTIONS = ["pcs", "box", "kg", "h", "m", "set"]
const VAT_OPTIONS = ["0", "4", "10", "22"]
const SKU_PAD = 3
const DESCRIPTION_SUFFIX = 1
const QUANTITY_CYCLE_LENGTH = 8
const QUANTITY_OFFSET = 1
const PRICE_BASE = 18.5
const PRICE_INCREMENT = 1.75
const DECIMAL_PLACES = 2
const INITIAL_LINE_ITEM_COUNT = 100
const DESCRIPTIONS = [
  "Consulting sprint",
  "Implementation block",
  "QA and regression pass",
  "Design system update",
  "Infrastructure maintenance",
  "On-site workshop",
  "Support retainer",
  "Data cleanup batch",
]

export function createInvoiceLineItem(index) {
  const code = `SKU-${String(index + DESCRIPTION_SUFFIX).padStart(SKU_PAD, "0")}`
  const unit = UNIT_OPTIONS[index % UNIT_OPTIONS.length]
  const vatPercentage = VAT_OPTIONS[index % VAT_OPTIONS.length]
  const quantity = (index % QUANTITY_CYCLE_LENGTH) + QUANTITY_OFFSET
  const price = Number(
    (PRICE_BASE + index * PRICE_INCREMENT).toFixed(DECIMAL_PLACES),
  )

  return {
    code,
    description: `${DESCRIPTIONS[index % DESCRIPTIONS.length]} ${index + DESCRIPTION_SUFFIX}`,
    unit,
    quantity,
    price,
    vatPercentage,
  }
}

export function createInvoiceLineItems(count) {
  return Array.from({ length: count }, (_, index) =>
    createInvoiceLineItem(index),
  )
}

export const entities = {
  form: {
    type: "InvoiceForm",
    initialValues: {
      invoiceNumber: "INV-2026-041",
      customer: "Northwind Trading",
      lineItems: createInvoiceLineItems(INITIAL_LINE_ITEM_COUNT),
    },
  },
}
