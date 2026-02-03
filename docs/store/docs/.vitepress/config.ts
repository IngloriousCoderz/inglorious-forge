import { defineConfig } from "vitepress"

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: "Inglorious Store",
  description:
    "A Redux-compatible, entity-based state library for elegant state management.",

  base: "/store/",

  head: [["meta", { name: "theme-color", content: "#3c3c3c" }]],

  themeConfig: {
    logo: "/transparent.png",
    siteTitle: "Inglorious Store",

    nav: [
      { text: "What is it?", link: "/guide/what-is" },
      { text: "Guide", link: "/guide/getting-started" },
      {
        text: "Learn More",
        items: [
          { text: "Core Concepts", link: "/guide/core-concepts" },
          { text: "Async Operations", link: "/advanced/async-operations" },
          { text: "Testing", link: "/advanced/testing" },
          { text: "Migration from Redux", link: "/advanced/migration" },
        ],
      },
      { text: "API Reference", link: "/api/reference" },
      { text: "Comparison", link: "/comparison" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Inglorious Store?", link: "/guide/what-is" },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Fundamentals",
          items: [
            { text: "Core Concepts", link: "/guide/core-concepts" },
            { text: "Event System", link: "/guide/event-system" },
          ],
        },
      ],
      "/advanced/": [
        {
          text: "Fundamentals",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Core Concepts", link: "/guide/core-concepts" },
            { text: "Event System", link: "/guide/event-system" },
          ],
        },
        {
          text: "Advanced Topics",
          items: [
            { text: "Async Operations", link: "/advanced/async-operations" },
            { text: "Systems", link: "/advanced/systems" },
            { text: "Testing", link: "/advanced/testing" },
          ],
        },
        {
          text: "Migration",
          items: [{ text: "From Redux & RTK", link: "/advanced/migration" }],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [{ text: "Store API", link: "/api/reference" }],
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
