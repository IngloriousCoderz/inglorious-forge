import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { html } from "@inglorious/web"

export function render(entity, api) {
  return Card.render({
    element: "footer",
    className: "actions-card",
    body: html`
      <div class="footer-copy">
        <strong>Stress target</strong>
        <p>
          A single keystroke in any row updates the line-item subtotal and the
          invoice total.
        </p>
      </div>

      <div class="footer-actions">
        ${Button.render({
          type: "Button",
          buttonType: "button",
          children: "Reset",
          color: "secondary",
          isDisabled: entity.isPristine,
          onClick: () => api.notify("#form:reset"),
          size: "sm",
          variant: "outline",
        })}
        ${Button.render({
          type: "Button",
          buttonType: "submit",
          children: "Submit invoice",
          color: "primary",
          isDisabled: !entity.isValid,
          size: "sm",
        })}
      </div>
    `,
    bodyPadding: "lg",
  })
}
