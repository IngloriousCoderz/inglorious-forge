import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

export const Message = {
  routeChange(entity, payload, api) {
    if (payload.route !== entity.id) return

    entity.messageId = Number(payload.params.messageId)
    api.notify("#inbox:read", entity.messageId)
  },

  render(entity, api) {
    const message = api
      .getEntity("inbox")
      .messages.find((message) => message.id === entity.messageId)

    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: message
        ? html`
            ${Typography.render({
              variant: "overline",
              children: `From ${message.from}`,
            })}
            ${Typography.render({
              variant: "h2",
              hasGutterBottom: true,
              children: message.subject,
            })}
            ${Typography.render({ variant: "body", children: message.body })}
          `
        : Typography.render({ variant: "h3", children: "No such message" }),
    })
  },
}
