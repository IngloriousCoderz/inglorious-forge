import "katex/dist/katex.min.css"
import "highlight.js/styles/github-dark.css"

import { renderMarkdown } from "@inglorious/ssx/markdown"
import { html, unsafeHTML } from "@inglorious/web"
import mermaid from "mermaid"

import { data } from "../../api/posts.js"
import { nav } from "../../components/nav.js"

export const post = {
  async routeChange(entity, payload, api) {
    if (payload.route !== entity.type) return

    const id = payload.params.slug
    if (entity.post?.id === id) return

    const entityId = entity.id
    const post = await fetchPost(id)
    // Simulate fetching markdown content
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
  return data.map((post) => `/posts/${post.id}`)
}

export async function load(entity, page) {
  const id = page.params.slug
  entity.post = await fetchPost(id)
  // Render markdown during build time
  entity.post.body = renderMarkdown(entity.post.body)
}

async function fetchPost(id) {
  return await data.find((post) => post.id === id)
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
