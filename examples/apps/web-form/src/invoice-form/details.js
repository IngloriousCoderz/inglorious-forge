import { Card } from "@inglorious/ui/card"
import { Input } from "@inglorious/ui/input"
import { html } from "@inglorious/web"

import { buildInputProps } from "./utils"
import { validateCustomer, validateInvoiceNumber } from "./validation"

export function render(entity, api) {
  return Card.render({
    element: "section",
    className: "panel-card",
    title: "Invoice details",
    subtitle: "Header fields kept small and direct.",
    body: html`
      <div class="meta-grid">
        ${Input.render(
          buildInputProps(entity, api, {
            id: "invoiceNumber",
            inputType: "text",
            label: "Invoice number",
            path: "invoiceNumber",
            size: "sm",
            validate: validateInvoiceNumber,
          }),
        )}
        ${Input.render(
          buildInputProps(entity, api, {
            id: "customer",
            inputType: "text",
            label: "Customer",
            path: "customer",
            size: "sm",
            validate: validateCustomer,
          }),
        )}
      </div>
    `,
    bodyPadding: "lg",
  })
}
