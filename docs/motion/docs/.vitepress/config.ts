import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Inglorious Motion",
  description:
    "CSS-first motion primitives for Inglorious Web with variant lifecycle, presence orchestration, and layout transitions.",

  base: "/motion/",

  head: [["meta", { name: "theme-color", content: "#3c3c3c" }]],

  themeConfig: {
    logo: "/transparent.png",
    siteTitle: "Inglorious Motion",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Examples", link: "/examples/web-motion" },
      { text: "API", link: "/api/reference" },
      { text: "Stability", link: "/advanced/stability" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Inglorious Motion?", link: "/guide/what-is" },
            {
              text: "Getting Started",
              link: "/guide/getting-started",
            },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [
            {
              text: "web-motion App",
              link: "/examples/web-motion",
            },
          ],
        },
      ],
      "/advanced/": [
        {
          text: "Production Readiness",
          items: [
            {
              text: "Stability Policy",
              link: "/advanced/stability",
            },
            {
              text: "Testing Strategy",
              link: "/advanced/testing",
            },
          ],
        },
      ],
      "/api/": [
        {
          text: "API",
          items: [
            {
              text: "API Reference",
              link: "/api/reference",
            },
          ],
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
