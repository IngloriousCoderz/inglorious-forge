import { Card } from "@inglorious/ui/card"
import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

export const ArticleList = {
  render(entity) {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        ${Typography.render({
          variant: "h2",
          hasGutterBottom: true,
          children: "Articles",
        })}
        ${entity.articles.map(
          (article) => html`
            <a class="link" href=${`/articles/${article.id}`}>
              ${Card.render({
                title: article.title,
                children: Typography.render({
                  variant: "body",
                  children: article.summary,
                }),
              })}
            </a>
          `,
        )}
      `,
    })
  },
}
