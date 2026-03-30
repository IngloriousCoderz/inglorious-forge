import { html } from "@inglorious/web"

import { typography } from "../../data-display/typography/index.js"
import { container } from "../../layout/container/index.js"
import { flex } from "../../layout/flex/index.js"
import { grid } from "../../layout/grid/index.js"
import { card } from "../../surfaces/card/index.js"
import { getPrimitiveContent } from "./primitive-content.js"

export const PrimitiveSection = {
  render(entity, api) {
    const router = api?.getEntity?.("router")
    const content = getPrimitiveContent(router?.path, entity)
    const name = content?.name ?? "Primitive"
    const category = content?.category ?? ""
    const summary = content?.summary
    const description = content?.description
    const useCases = content?.useCases ?? []
    const example = content?.example
    const exampleCode = example?.code
    const examplePreview =
      typeof example?.preview === "function"
        ? example.preview()
        : example?.preview
    const showEmpty = !content

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
              typography.render({
                variant: "h4",
                children: showEmpty ? "Choose a Primitive" : name,
              }),
              category
                ? typography.render({
                    variant: "body2",
                    color: "secondary",
                    children: `Category: ${category}`,
                  })
                : "",
              summary
                ? typography.render({
                    variant: "body1",
                    color: "secondary",
                    children: summary,
                  })
                : "",
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
                    children: showEmpty
                      ? "Pick a primitive from the drawer to see details."
                      : `Documentation for ${name}`,
                  })}
                  ${typography.render({
                    variant: "body1",
                    children:
                      description ??
                      "This section is wired for per-primitive docs and examples.",
                  })}
                  ${useCases.length
                    ? html`
                        <div style="margin-top: 16px; text-align: left;">
                          ${typography.render({
                            variant: "body2",
                            color: "secondary",
                            children: "Common use cases",
                          })}
                          <ul style="margin: 8px 0 0; padding-left: 20px;">
                            ${useCases.map(
                              (useCase) => html`<li>${useCase}</li>`,
                            )}
                          </ul>
                        </div>
                      `
                    : ""}
                </div>
              `,
            }),
          }),
          showEmpty
            ? ""
            : card.render({
                padding: "xl",
                className: "iw-primitive-example",
                children: flex.render({
                  direction: "column",
                  gap: "md",
                  children: [
                    typography.render({
                      variant: "h6",
                      children: "Example",
                    }),
                    grid.render({
                      minColumnWidth: "18rem",
                      gap: "lg",
                      children: [
                        flex.render({
                          direction: "column",
                          gap: "sm",
                          children: [
                            typography.render({
                              variant: "body2",
                              color: "secondary",
                              children: "Code",
                            }),
                            html`<pre
                              class="iw-primitive-code"
                            ><code>${exampleCode ??
                            "// Example coming soon."}</code></pre>`,
                          ],
                        }),
                        flex.render({
                          direction: "column",
                          gap: "sm",
                          children: [
                            typography.render({
                              variant: "body2",
                              color: "secondary",
                              children: "Result",
                            }),
                            html`<div class="iw-primitive-preview">
                              ${examplePreview ??
                              html`<div class="iw-primitive-preview-empty">
                                Preview coming soon.
                              </div>`}
                            </div>`,
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
        ],
      }),
    })
  },
}
