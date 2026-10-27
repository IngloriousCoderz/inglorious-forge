---
layout: home
title: Inglorious SSX
description: Pre-rendered sites with Inglorious Web, static or server-rendered.

hero:
  name: Inglorious SSX
  text: Pre-rendered Sites with Entities
  tagline: Static generation by default, server rendering on request, hydrated with Inglorious Web.
  image:
    src: /transparent.png
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: What is SSX?
      link: /guide/what-is
    - theme: alt
      text: Rendering Modes
      link: /guide/rendering-modes

features:
  - title: Static by Default
    details: "`ssx build` renders every page once, to HTML any static host can serve."
  - title: Server Rendering on Request
    details: "A page that exports `ssr` is rendered per request, its `load` reading the request's params, headers and cookies."
  - title: Hydrated
    details: The HTML comes alive in the browser as an Inglorious Web app, with client-side navigation between pages.
  - title: File-Based Routing
    details: "Pages are files in `src/pages/`; `_id.js` is a dynamic route, `staticPaths` lists its pages when they are static."
  - title: API Routes
    details: Endpoints in `src/api/` with the Web Fetch API, served beside the pages.
  - title: Content
    details: Markdown pages, JSX or Vue-like templates, i18n routes, sitemap, RSS and image optimization.
---
