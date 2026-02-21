import { html } from "@inglorious/web"

export const nav = {
  render() {
    return html`<nav>
      <a href="/">Home</a> | <a href="/about">About</a> |
      <a href="/hello">Hello</a> | <a href="/blog">Blog</a> |
      <a href="/markdown">Markdown</a>
    </nav>`
  },
}
