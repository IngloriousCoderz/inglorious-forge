const VAT_OPTIONS = new Set(["0", "4", "10", "22"])
const ZERO = 0

export function validateInvoiceForm(values) {
  return {
    invoiceNumber: validateInvoiceNumber(values.invoiceNumber),
    customer: validateCustomer(values.customer),
    lineItems: values.lineItems.map(validateLineItem),
  }
}

export function validateInvoiceNumber(invoiceNumber) {
  return !invoiceNumber ? "Missing invoice number" : null
}

export function validateCustomer(customer) {
  return !customer ? "Missing customer" : null
}

export function validateLineItem(lineItem) {
  return {
    code: validateCode(lineItem.code),
    description: validateDescription(lineItem.description),
    unit: validateUnit(lineItem.unit),
    quantity: validateQuantity(lineItem.quantity),
    price: validatePrice(lineItem.price),
    vatPercentage: validateVatPercentage(lineItem.vatPercentage),
  }
}

export function validateCode(code) {
  return !code ? "Missing code" : null
}

export function validateDescription(description) {
  return !description ? "Missing description" : null
}

export function validateUnit(unit) {
  return !unit ? "Missing unit" : null
}

export function validateQuantity(quantity) {
  return quantity == null || Number.isNaN(quantity) || quantity <= ZERO
    ? "Quantity must be greater than 0"
    : null
}

export function validatePrice(price) {
  return price == null || Number.isNaN(price) || price <= ZERO
    ? "Price must be greater than 0"
    : null
}

export function validateVatPercentage(vatPercentage) {
  return VAT_OPTIONS.has(String(vatPercentage))
    ? null
    : "Choose a VAT percentage"
}
