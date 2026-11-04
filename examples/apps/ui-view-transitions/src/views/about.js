import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

export const About = {
  render() {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        ${Typography.render({
          variant: "h2",
          hasGutterBottom: true,
          children: "Sliding between tabs",
        })}
        ${Typography.render({
          variant: "body",
          hasGutterBottom: true,
          children: html`Every tap on a tab is a push, so the history alone
            would always slide forward. The <code>direction</code> option of
            <code>withTransitions</code> looks at where the two tabs sit in the
            bar instead: a tab to the right arrives from the right, a tab to the
            left arrives from the left.`,
        })}
        ${Typography.render({
          variant: "body",
          children: html`Navigations that stay within a tab, such as opening an
          article, keep the direction read from the history.`,
        })}
      `,
    })
  },
}
