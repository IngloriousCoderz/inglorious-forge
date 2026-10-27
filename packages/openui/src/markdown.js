import { unsafeHTML } from "@inglorious/web/directives/unsafe-html"
import MarkdownIt from "markdown-it"

/**
 * Markdown as the model writes it, with raw HTML turned off: tags in the text
 * come out escaped, and markdown-it refuses `javascript:` and similar links,
 * so what it renders is safe to put on the page as HTML.
 */
const markdown = new MarkdownIt({ html: false, linkify: true })

// Links lead away from the answer, so they open apart from it.
const renderLink =
  markdown.renderer.rules.link_open ??
  ((tokens, index, options, _, self) =>
    self.renderToken(tokens, index, options))
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  tokens[index].attrSet("target", "_blank")
  tokens[index].attrSet("rel", "noopener noreferrer")
  return renderLink(tokens, index, options, env, self)
}

/** Block markdown: paragraphs, lists, headings, tables, code. */
export function renderMarkdown(text) {
  return unsafeHTML(markdown.render(text ?? ""))
}

/** Inline markdown, for text already inside a paragraph: bold, links, code. */
export function renderInlineMarkdown(text) {
  return unsafeHTML(markdown.renderInline(text ?? ""))
}
