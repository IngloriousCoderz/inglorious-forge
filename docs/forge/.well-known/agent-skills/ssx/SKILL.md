---
name: ssx
description: "@inglorious/ssx: file-based static generation, on-request SSR and hydration for Inglorious Web."
---

# @inglorious/ssx

`npx @inglorious/create-app my-site --template ssx-js`.

## Routing

`src/pages/`: `index.js` → `/`, `posts/_slug.js` → `/posts/:slug`, `__path.js` → `*`. `.md` pages work too (frontmatter → metadata; highlight.js, KaTeX, Mermaid).

## Page exports

```javascript
import { html } from "@inglorious/web";

export const Post = {
  render(entity, api) {
    return html`<h1>${entity.post.title}</h1>`;
  },
};

export const metadata = (entity) => ({ title: entity.post.title, meta: { description: entity.post.summary } }); // or a plain object

export async function load(entity, page) {
  entity.post = await fetch(`https://api.example.com/posts/${page.params.slug}`).then((r) => r.json());
}

export async function staticPaths() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());
  return posts.map((post) => ({ params: { slug: post.slug }, path: `/posts/${post.slug}` }));
}
```

- Pages are static: `load` runs at build time. Dynamic routes need `staticPaths()`.
- `export const ssr = true` renders on every request (own store per request, no `staticPaths`); `page` has `params`, `locale`, `request` (Fetch `Request`).
- Entities go in `src/store/entities.js` as in Inglorious Web. Navigate with `api.notify("#router:navigate", "/posts")` or `{ to, replace: true }`.

## site.config.js

```javascript
export default {
  title: "My Site",
  meta: { description: "..." },
  sitemap: { hostname: "https://mysite.com", filter: (page) => !page.path.startsWith("/admin") },
  rss: { title, description, link, feedPath: "/feed.xml", filter },
  markdown: { theme: "github-dark" },
  vite: { plugins: [jsx()] },
};
```

JSX pages are `.jsx`/`.tsx` ([vite-plugin-jsx](../vite-plugin-jsx/SKILL.md)). Vue ([vite-plugin-vue](../vite-plugin-vue/SKILL.md)): `.vue` isn't routed; re-export from a `.js` page next to `metadata` (`export { About } from "./about.vue"`, with `// @ts-expect-error - Handled by @inglorious/vite-plugin-vue` in TS).

## CLI

- `ssx dev` (`-c`, `-r`, `-p 3000`): renders on request.
- `ssx build` (`-o dist`, `-i`, `-f`): skips `ssr` pages; optimizes images.
- `ssx serve` / `preview`: serves `dist/` (+ `src/api/`), no `ssr` pages.
- `ssx ssr` (`-c`, `-r`, `-p`): renders every page on request, no build; or `import { ssr } from "@inglorious/ssx/ssr"`.
