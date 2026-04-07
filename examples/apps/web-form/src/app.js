import { Container } from "@inglorious/ui/container"
import { html } from "@inglorious/web"

export const app = {
  render(api) {
    return html`${Container.render({
      element: "main",
      className: "iw-theme-bootstrap iw-theme-light page-shell",
      maxWidth: "xl",
      padding: "md",
      children: api.render("form"),
    })}`
  },
}
