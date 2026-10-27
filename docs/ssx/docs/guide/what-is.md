---
title: "What is SSX?"
description: "Pre-rendered sites with Inglorious Web: static generation, server rendering on request, hydration."
---

# What is SSX?

**Static Site Xecution (SSX)** renders [Inglorious Web](https://inglorious.dev/web/) apps to HTML on the server, at build time or on each request, then hydrates them in the browser. One page can be static and the next server-rendered, with the same entity-based types throughout.

## Why SSX?

### Fast by Default

- **Pre-rendered HTML** - Every page arrives as HTML, built ahead or rendered on request
- **Instant load times** - Static pages need no server work at all
- **CDN-ready** - A static site deploys anywhere static files are served
- **Perfect Lighthouse scores** - SEO and performance out of the box

### Simple Architecture

- **Static or server-rendered** - Pure static files, or a server for the pages that need one
- **No complex build configs** - Convention over configuration
- **File-based routing** - Pages are just files in `src/pages/`
- **Entity-based state** - Same familiar patterns from @inglorious/web

### Modern DX

- **Hot reload dev server** - See changes instantly
- **Lazy-loaded routes** - Code splitting automatically
- **lit-html hydration** - Interactive UI without the bloat
- **TypeScript ready** - Write your pages and entities in TypeScript
- **Image optimization** - Automatic compression for static assets
- **Markdown support** - Built-in support for `.md` pages with code highlighting and math

### Production Ready

- **Automatic code splitting** - Per-page bundles
- **Optimized builds** - Minified, tree-shaken output
- **Source maps** - Debug production like development
- **Error boundaries** - Graceful failure handling
- **Serverless functions** - API routes with Web Fetch API

## Comparison to Other Tools

| Feature            | SSX         | Next.js  | Astro  | Eleventy |
| ------------------ | ----------- | -------- | ------ | -------- |
| Pre-rendered HTML  | ✅          | ✅       | ✅     | ✅       |
| SSR on request     | ✅          | ✅       | ✅     | ❌       |
| Client hydration   | ✅ lit-html | ✅ React | ✅ Any | ❌       |
| Client routing     | ✅          | ✅       | ✅     | ❌       |
| Lazy loading       | ✅          | ✅       | ✅     | ❌       |
| Entity-based state | ✅          | ❌       | ❌     | ❌       |
| Zero config        | ✅          | ❌       | ❌     | ❌       |
| Framework agnostic | ❌          | ❌       | ✅     | ✅       |

SSX is perfect if you:

- Want static site performance, with server rendering where it is needed
- Love entity-based architecture
- Prefer convention over configuration
- Need full client-side interactivity
- Don't want React/Vue lock-in

## Philosophy

SSX embraces the philosophy of [@inglorious/web](https://www.npmjs.com/package/@inglorious/web):

- **Simplicity over cleverness** - Obvious beats clever
- **Convention over configuration** - Sensible defaults
- **Predictability over magic** - Explicit is better than implicit
- **Standards over abstractions** - Use the platform

Rendering on the server should be simple, at build time or on request. SSX makes it simple.
