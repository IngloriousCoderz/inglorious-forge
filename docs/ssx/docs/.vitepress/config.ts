import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Inglorious SSX",
  description:
    "Pre-rendered sites with Inglorious Web: static generation, server-side rendering on request, hydration, API routes and file-based routing.",

  base: "/ssx/",

  head: [["meta", { name: "theme-color", content: "#3c3c3c" }]],

  themeConfig: {
    logo: "/transparent.png",
    siteTitle: "Inglorious SSX",

    nav: [
      { text: "What is it?", link: "/guide/what-is" },
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/reference" },
      { text: "Inglorious Web", link: "https://inglorious.dev/web/" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is SSX?", link: "/guide/what-is" },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Pages",
          items: [
            { text: "Rendering Modes", link: "/guide/rendering-modes" },
            { text: "Routing", link: "/guide/routing" },
            { text: "Data and State", link: "/guide/data-loading" },
            { text: "Metadata, Sitemap and RSS", link: "/guide/metadata" },
            { text: "Internationalization", link: "/guide/i18n" },
            { text: "Markdown, JSX and Vue", link: "/guide/content" },
          ],
        },
        {
          text: "Server",
          items: [
            { text: "API Routes", link: "/guide/api-routes" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [{ text: "Commands and functions", link: "/api/reference" }],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/IngloriousCoderz/inglorious-forge",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-Present Matteo Antony Mistretta",
    },
  },

  markdown: {
    lineNumbers: true,
  },
})
