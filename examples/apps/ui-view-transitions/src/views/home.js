import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

const STEPS = [
  {
    title: "Forward",
    body: "Open an article from the list, or follow any link. A push raises the history index, so the page arrives from the right while the one you left slides out to the left.",
  },
  {
    title: "Back",
    body: "Press the browser back button, or the one at the bottom. A traversal lowers the index, so the page arrives from the left instead.",
  },
  {
    title: "Replace",
    body: "Mark an article as read on its page. That replaces the current entry rather than stacking a new one, so there is no direction to slide towards and the page cross-fades instead.",
  },
  {
    title: "Reduced motion",
    body: "Turn on your operating system's reduce motion setting and reload. The animations sit behind prefers-reduced-motion, so the same navigations become instant.",
  },
]

/* Curried rather than written inline, so the handler is built once per render
 * from the api instead of being a new closure on every notification. */
function navigate(api, payload) {
  return () => api.notify("#router:navigate", payload)
}

export const Home = {
  render(entity, api) {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        ${Typography.render({
          variant: "h2",
          hasGutterBottom: true,
          children: "Directional page transitions",
        })}
        ${Typography.render({
          variant: "body",
          hasGutterBottom: true,
          children: html`Every navigation here is tagged with the direction it
            travelled, and the stylesheet in
            <code>@inglorious/ui/view-transitions.css</code> turns that tag into
            a slide.`,
        })}
        ${STEPS.map((step) =>
          Card.render({
            className: "step",
            title: step.title,
            children: Typography.render({
              variant: "body",
              children: step.body,
            }),
          }),
        )}
        ${Button.render({
          color: "primary",
          onClick: navigate(api, "/articles"),
          children: "Open the list",
        })}
      `,
    })
  },
}
