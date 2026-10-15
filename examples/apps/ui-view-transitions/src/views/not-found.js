import { Button } from "@inglorious/ui/button"
import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

function goHome(api) {
  return () => api.notify("#router:navigate", "/")
}

export const NotFound = {
  render(entity, api) {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        ${Typography.render({
          variant: "h3",
          hasGutterBottom: true,
          children: "Not found",
        })}
        ${Typography.render({
          variant: "body",
          hasGutterBottom: true,
          children: html`Nothing is routed to
            <code>${api.getEntity("router").path}</code>.`,
        })}
        ${Button.render({
          color: "primary",
          onClick: goHome(api),
          children: "Go home",
        })}
      `,
    })
  },
}
