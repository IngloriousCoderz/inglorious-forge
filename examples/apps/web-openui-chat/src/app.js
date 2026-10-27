import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return Container.render({
      maxWidth: "md",
      padding: "md",
      className: "app",
      children: html`${Typography.render({
        variant: "h1",
        children: "OpenUI chat",
      })}
      ${api.render("chat")}`,
    })
  },
}
