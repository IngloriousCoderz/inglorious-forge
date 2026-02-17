import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Inglorious Charts",
  description:
    "Declarative charting for Inglorious Web with config-first and composition rendering modes.",

  base: "/charts/",

  head: [["meta", { name: "theme-color", content: "#3c3c3c" }]],

  themeConfig: {
    logo: "/transparent.png",
    siteTitle: "Inglorious Charts",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Examples", link: "/examples/config-mode" },
      { text: "API", link: "/api/reference" },
      { text: "Advanced", link: "/advanced/testing" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Inglorious Charts?", link: "/guide/what-is" },
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
              text: "Config-first Mode",
              link: "/examples/config-mode",
            },
            {
              text: "Composition Mode",
              link: "/examples/composition-mode",
            },
          ],
        },
      ],
      "/advanced/": [
        {
          text: "Advanced",
          items: [
            {
              text: "Testing",
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
