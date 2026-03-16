import { html } from "@inglorious/web"

import { typography } from "../../data-display/typography/index.js"
import { container } from "../../layout/container/index.js"
import { flex } from "../../layout/flex/index.js"
import { card } from "../../surfaces/card/index.js"

export const primitiveSection = {
  render(entity) {
    const { name, category } = entity

    return container.render({
      maxWidth: "xl",
      padding: "lg",
      className: "iw-dashboard-container",
      children: flex.render({
        direction: "column",
        gap: "lg",
        children: [
          flex.render({
            direction: "column",
            gap: "xs",
            children: [
              typography.render({ variant: "h4", children: name }),
              typography.render({
                variant: "body2",
                color: "secondary",
                children: `Category: ${category}`,
              }),
            ],
          }),
          card.render({
            padding: "xl",
            children: flex.render({
              align: "center",
              justify: "center",
              padding: "xl",
              className: "iw-primitive-placeholder",
              children: html`
                <div style="text-align: center;">
                  ${typography.render({
                    variant: "h6",
                    children: `Documentation and examples for ${name} will appear here.`,
                  })}
                  ${typography.render({
                    variant: "body1",
                    children:
                      "This is a placeholder for the primitive documentation section.",
                  })}
                </div>
              `,
            }),
          }),
        ],
      }),
    })
  },
}
