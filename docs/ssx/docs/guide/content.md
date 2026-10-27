---
title: "Markdown, JSX and Vue"
description: "Pages written in Markdown, JSX or Vue-like templates, and optimized images."
---

# Markdown, JSX and Vue

Pages need not be written with lit-html.

## Markdown Support

SSX treats `.md` files as first-class pages. You can create `src/pages/post.md` and it will be rendered automatically.

- **Frontmatter** - Metadata is exported as `metadata`
- **Code highlighting** - Built-in syntax highlighting with `highlight.js`
- **Math support** - LaTeX support via `katex` (use `$E=mc^2$` or `$$...$$`)
- **Mermaid diagrams** - Use `mermaid` code blocks (requires client-side mermaid.js)

Configure the syntax highlighting theme in `site.config.js`:

```javascript
export default {
  markdown: {
    theme: "monokai", // default: "github-dark"
  },
}
```

Example markdown file:

```markdown
---
title: My Post
---

# Hello World

This is a markdown page.
```

## JSX and Vue Pages

Pages can be written in JSX or Vue-like templates instead of lit-html. Add the plugin to the `vite` config in `site.config.js`, and SSX uses it both to render pages at build time and to hydrate them in the browser:

```javascript
import { jsx } from "@inglorious/vite-plugin-jsx"

export default {
  vite: {
    plugins: [jsx()],
  },
}
```

With [`@inglorious/vite-plugin-jsx`](https://www.npmjs.com/package/@inglorious/vite-plugin-jsx), pages are `.jsx` or `.tsx` files, exporting their type and `metadata` as usual.

With [`@inglorious/vite-plugin-vue`](https://www.npmjs.com/package/@inglorious/vite-plugin-vue), a `.vue` file only exports its type, so SSX does not route it. Each page is a `.js` or `.ts` module that re-exports the type from its `.vue` file, next to its `metadata`:

```javascript
// src/pages/about.js
export { About } from "./about.vue"

export const metadata = {
  title: "About",
}
```

`create-app` sets either up with `--template=ssx-js --syntax=jsx` or `--syntax=vue`.

## Image Optimization

SSX includes built-in image optimization using `vite-plugin-image-optimizer`.

- **Automatic compression** - PNG, JPEG, GIF, SVG, WebP, and AVIF are compressed at build time
- **Lossless & lossy** - Configurable settings via `vite` config in `site.config.js`
