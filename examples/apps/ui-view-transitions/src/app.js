import { AppBar } from "@inglorious/ui/app-bar"
import { Button } from "@inglorious/ui/button"
import { Container } from "@inglorious/ui/container"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

const BACK = -1

export const app = {
  render(api) {
    const router = api.getEntity("router")

    return html`
      <header class="chrome">
        ${AppBar.render({
          title: "ui-view-transitions",
          children: html`
            <a class="skip" href="/">Home</a>
            <a class="skip" href="/articles">Articles</a>
          `,
        })}
      </header>

      <main class="content">
        ${when(router.isLoading, () => html`<p>Loading...</p>`)}
        ${when(!router.isLoading && Boolean(router.route), () =>
          api.render(router.route),
        )}
      </main>

      <footer class="chrome">
        ${Container.render({
          maxWidth: "md",
          padding: "sm",
          children: Button.render({
            variant: "outline",
            size: "sm",
            onClick: goBack(api),
            children: "Go back",
          }),
        })}
      </footer>
    `
  },
}

function goBack(api) {
  return () => api.notify("#router:navigate", BACK)
}
