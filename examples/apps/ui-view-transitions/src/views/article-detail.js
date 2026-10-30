import { Button } from "@inglorious/ui/button"
import { Card } from "@inglorious/ui/card"
import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"

const BACK = -1

export const ArticleDetail = {
  routeChange(entity, payload, api) {
    if (payload.route !== entity.id) return

    const { articles } = api.getEntity("articleList")
    entity.article = articles.find(
      (article) => article.id === payload.params.articleId,
    )
  },

  render(entity, api) {
    const { article } = entity
    const isRead = Boolean(api.getEntity("router").query.read)

    if (!article) {
      return Container.render({
        maxWidth: "md",
        padding: "lg",
        children: html`
          ${Typography.render({
            variant: "h3",
            hasGutterBottom: true,
            children: "No such article",
          })}
          ${Button.render({ onClick: goBack(api), children: "Go back" })}
        `,
      })
    }

    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        ${Typography.render({
          variant: "overline",
          children: `Article ${article.id}`,
        })}
        ${Typography.render({
          variant: "h2",
          hasGutterBottom: true,
          children: article.title,
        })}
        ${Card.render({
          children: Typography.render({
            variant: "body",
            children: article.body,
          }),
        })}
        <div class="actions">
          ${Button.render({ onClick: goBack(api), children: "Go back" })}
          ${Button.render({
            color: "primary",
            isDisabled: isRead,
            onClick: markAsRead(api, article.id),
            children: isRead ? "Marked as read" : "Mark as read",
          })}
        </div>
      `,
    })
  },
}

function markAsRead(api, articleId) {
  return () =>
    api.notify("#router:navigate", {
      to: `/articles/${articleId}?read=1`,
      replace: true,
    })
}

function goBack(api) {
  return () => api.notify("#router:navigate", BACK)
}
