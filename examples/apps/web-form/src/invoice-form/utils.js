import { getFieldError, getFieldValue } from "@inglorious/web/form"

import {
  FALLBACK_NUMBER,
  MONEY_DECIMALS,
  VAT_PERCENT_DIVISOR,
} from "./constants"

const moneyFormatter = new Intl.NumberFormat("en-US", {
  currency: "EUR",
  maximumFractionDigits: MONEY_DECIMALS,
  minimumFractionDigits: MONEY_DECIMALS,
  style: "currency",
})

export function buildInputProps(
  entity,
  api,
  { id, inputType, path, size, validate, label },
) {
  const value = getFieldValue(entity, path)
  const error = getFieldError(entity, path)

  return {
    id,
    inputType,
    label,
    name: path,
    size,
    value: value == null ? "" : String(value),
    error,
    isFullWidth: true,
    onChange: (nextValue) =>
      api.notify(`#${entity.id}:fieldChange`, {
        path,
        value: parseValue(nextValue, inputType),
        validate,
      }),
    onBlur: () =>
      api.notify(`#${entity.id}:fieldBlur`, {
        path,
        validate,
      }),
  }
}

export function buildSelectProps({ id, options, path, size, validate, label }) {
  return {
    id,
    name: path,
    options,
    size,
    label,
    path,
    validate,
  }
}

export function calculateLineSubtotal(lineItem) {
  return toNumber(lineItem.quantity) * toNumber(lineItem.price)
}

export function summarizeLineItems(lineItems) {
  let subtotal = 0
  let vat = 0

  for (const lineItem of lineItems) {
    const lineSubtotal = calculateLineSubtotal(lineItem)
    const vatRate = toNumber(lineItem.vatPercentage) / VAT_PERCENT_DIVISOR
    subtotal += lineSubtotal
    vat += lineSubtotal * vatRate
  }

  subtotal = roundMoney(subtotal)
  vat = roundMoney(vat)

  return {
    grandTotal: roundMoney(subtotal + vat),
    subtotal,
    vat,
  }
}

export function formatMoney(value) {
  return moneyFormatter.format(value)
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function parseValue(value, type) {
  switch (type) {
    case "number":
      return value === "" ? null : Number(value)

    default:
      return value
  }
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : FALLBACK_NUMBER
}

function roundMoney(value) {
  return Number(value.toFixed(MONEY_DECIMALS))
}
