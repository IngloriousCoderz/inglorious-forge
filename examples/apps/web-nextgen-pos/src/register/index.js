import { Alert } from "@inglorious/ui/alert"
import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { renderPatterns } from "../patterns/index.js"

const STATE_LABELS = {
  open: "Entering items",
  totaling: "Totaling",
  paying: "Awaiting payment",
  complete: "Complete",
}

export const Register = {
  /**
   * Creator: the register records sales, so the register makes them. Making one is
   * announcing that it has entered the world; the store does the rest, including
   * running the new sale's `create`.
   */
  saleStart(entity, _, api) {
    entity.saleCount++
    entity.saleId = `sale${entity.saleCount}`

    api.notify("add", {
      id: entity.saleId,
      type: "Sale",
      state: "open",
      lines: [],
      tax: null,
      error: null,
    })
  },

  render(entity, api) {
    const sale = entity.saleId && api.getEntity(entity.saleId)
    const canStart = !sale || sale.state === "complete"

    return Card.render({
      title: "Register",
      subtitle: sale
        ? `Sale #${entity.saleCount} · ${STATE_LABELS[sale.state]}`
        : "No sale in progress",
      children: when(
        sale,
        () => api.render(sale.id),
        () =>
          Alert.render({
            severity: "neutral",
            description: "Press “New sale” to serve a customer.",
          }),
      ),
      footer: html`<div class="register-footer">
        ${Button.render({
          children: "New sale",
          color: "primary",
          variant: canStart ? "default" : "outline",
          isDisabled: !canStart,
          onClick: () => api.notify(`#${entity.id}:saleStart`),
        })}
        ${renderPatterns([
          "Controller",
          "Creator",
          "Information Expert",
          "State",
          "Template Method",
          "Model-View Separation",
        ])}
      </div>`,
    })
  },
}
