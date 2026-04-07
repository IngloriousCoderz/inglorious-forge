import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { Input } from "@inglorious/ui/input"
import { Select } from "@inglorious/ui/select"
import { html } from "@inglorious/web"
import { getFieldError, getFieldValue } from "@inglorious/web/form"

import { UNIT_OPTIONS, VAT_OPTIONS } from "./constants"
import {
  buildInputProps,
  buildSelectProps,
  calculateLineSubtotal,
  formatMoney,
} from "./utils"
import {
  validateCode,
  validateDescription,
  validatePrice,
  validateQuantity,
  validateUnit,
  validateVatPercentage,
} from "./validation"

export function render(entity, api) {
  return Card.render({
    element: "section",
    className: "panel-card",
    header: html`
      <div class="panel-header">
        <div>
          <h2>Line items</h2>
          <p>
            Code, description, unit, quantity, price, VAT, and live subtotal for
            each of the 100 rows.
          </p>
        </div>
        ${Button.render({
          type: "Button",
          buttonType: "button",
          children: "Add row",
          color: "primary",
          onClick: entity.onAddRow,
          size: "sm",
          variant: "outline",
        })}
      </div>
    `,
    body: html`
      <div class="table-shell">
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Measure unit</th>
              <th>Qty</th>
              <th>Price</th>
              <th>VAT %</th>
              <th>Sub-total</th>
            </tr>
          </thead>
          <tbody>
            ${entity.values.lineItems.map(
              (lineItem, index) =>
                html`<tr>
                  <td>
                    ${Input.render(
                      buildInputProps(entity, api, {
                        id: `lineItems.${index}.code`,
                        inputType: "text",
                        path: `lineItems.${index}.code`,
                        size: "sm",
                        validate: validateCode,
                      }),
                    )}
                  </td>
                  <td>
                    ${Input.render(
                      buildInputProps(entity, api, {
                        id: `lineItems.${index}.description`,
                        inputType: "text",
                        path: `lineItems.${index}.description`,
                        size: "sm",
                        validate: validateDescription,
                      }),
                    )}
                  </td>
                  <td>
                    ${renderSelectCell(
                      entity,
                      api,
                      buildSelectProps({
                        id: `lineItems.${index}.unit`,
                        options: UNIT_OPTIONS,
                        path: `lineItems.${index}.unit`,
                        size: "sm",
                        validate: validateUnit,
                      }),
                    )}
                  </td>
                  <td>
                    ${Input.render(
                      buildInputProps(entity, api, {
                        id: `lineItems.${index}.quantity`,
                        inputType: "number",
                        path: `lineItems.${index}.quantity`,
                        size: "sm",
                        validate: validateQuantity,
                      }),
                    )}
                  </td>
                  <td>
                    ${Input.render(
                      buildInputProps(entity, api, {
                        id: `lineItems.${index}.price`,
                        inputType: "number",
                        path: `lineItems.${index}.price`,
                        size: "sm",
                        validate: validatePrice,
                      }),
                    )}
                  </td>
                  <td>
                    ${renderSelectCell(
                      entity,
                      api,
                      buildSelectProps({
                        id: `lineItems.${index}.vatPercentage`,
                        options: VAT_OPTIONS,
                        path: `lineItems.${index}.vatPercentage`,
                        size: "sm",
                        validate: validateVatPercentage,
                      }),
                    )}
                  </td>
                  <td class="subtotal-cell">
                    ${formatMoney(calculateLineSubtotal(lineItem))}
                  </td>
                </tr>`,
            )}
          </tbody>
        </table>
      </div>
    `,
    footer: html`
      <table class="invoice-table invoice-table--summary">
        <tfoot>
          <tr class="summary-row">
            <th colspan="6">Net subtotal</th>
            <td>${formatMoney(entity.totals.subtotal)}</td>
          </tr>
          <tr class="summary-row">
            <th colspan="6">VAT total</th>
            <td>${formatMoney(entity.totals.vat)}</td>
          </tr>
          <tr class="summary-row summary-row--grand">
            <th colspan="6">Grand total</th>
            <td>${formatMoney(entity.totals.grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    `,
    bodyPadding: "lg",
  })
}

function renderSelectCell(
  entity,
  api,
  { id, options, path, size, validate, label },
) {
  const value = getFieldValue(entity, path)
  const error = getFieldError(entity, path)

  return html`<div class="cell-field">
    ${Select.render({
      id,
      name: path,
      options,
      value: value == null ? "" : String(value),
      size,
      isFullWidth: true,
      "aria-label": label ?? path,
      "aria-invalid": error ? "true" : "false",
      "data-error": error ? "true" : null,
      onChange: (nextValue) =>
        api.notify(`#${entity.id}:fieldChange`, {
          path,
          value: nextValue,
          validate,
        }),
      onBlur: () =>
        api.notify(`#${entity.id}:fieldBlur`, {
          path,
          validate,
        }),
    })}
    ${error ? html`<div class="cell-error">${error}</div>` : ""}
  </div>`
}
