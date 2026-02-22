import "katex/dist/katex.min.css"
import "highlight.js/styles/github-dark.css"

import { renderMarkdown } from "@inglorious/ssx/markdown"
import { html, unsafeHTML } from "@inglorious/web"
import mermaid from "mermaid"

import { nav } from "../../components/nav.js"

export const post = {
  async routeChange(entity, { route, params }, api) {
    if (route !== entity.type) return

    const entityId = entity.id
    const response = await fetch(`/api/posts/${params.slug}`)
    const post = await response.json()
    post.body = renderMarkdown(post.body)
    api.notify(`#${entityId}:dataFetchSuccess`, post)
  },

  dataFetchSuccess(entity, post) {
    entity.post = post
  },

  render(entity) {
    if (!entity.post) return

    // Initialize mermaid if present
    if (typeof window !== "undefined") {
      setTimeout(() => {
        mermaid.run({ querySelector: ".mermaid" })
      })
    }

    return html`<h1>${entity.post.title}</h1>
      ${nav.render()}
      <div>${entity.post.date}</div>
      <div class="markdown-body">${unsafeHTML(entity.post.body)}</div>`
  },
}

export async function staticPaths() {
  const { data } = await import("../../api/posts.js")
  return data.map((post) => `/posts/${post.id}`)
}

export async function load(entity, page) {
  const id = page.params.slug
  const { data } = await import("../../api/posts.js")
  entity.post = data.find((post) => post.id === id)
  entity.post.body = renderMarkdown(entity.post.body)
}

export const metadata = (entity) => ({
  title: entity.post.title,
  meta: {
    description: "Blog Post",
  },
  // Sitemap-specific metadata
  changefreq: "monthly",
  priority: 0.8,
  updatedAt: entity.post.date,
  // RSS-specific metadata
  pubDate: entity.post.date,
  author: "Matteo Antony Mistretta",
  category: "Chronicle",
})
