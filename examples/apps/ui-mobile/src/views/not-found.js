import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"

export const NotFound = {
  render() {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: Typography.render({ variant: "h3", children: "Not found" }),
    })
  },
}
