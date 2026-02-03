import { defineConfig } from "vitepress"

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: "Inglorious Web",
  description:
    "Lightweight, predictable web framework built on pure JavaScript, entity-based state management, and lit-html",

  base: "/web/",

  head: [["meta", { name: "theme-color", content: "#3c3c3c" }]],

  themeConfig: {
    logo: "/transparent.png",
    siteTitle: "Inglorious Web",

    nav: [
      { text: "What is it?", link: "/guide/what-is" },
      { text: "Guide", link: "/guide/getting-started" },
      {
        text: "Learn More",
        items: [
          { text: "Core Concepts", link: "/guide/core-concepts" },
          { text: "Type Composition", link: "/advanced/type-composition" },
          { text: "Testing", link: "/advanced/testing" },
          { text: "Performance", link: "/advanced/performance" },
        ],
      },
      { text: "Components", link: "/components/overview" },
      { text: "API Reference", link: "/api/reference" },
      { text: "Comparison", link: "/comparison" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is it?", link: "/guide/what-is" },
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Core Concepts", link: "/guide/core-concepts" },
            { text: "Rendering Model", link: "/guide/rendering-model" },
          ],
        },
        {
          text: "Fundamentals",
          items: [
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Entity Render Methods", link: "/guide/entity-renders" },
            { text: "Event System", link: "/guide/event-system" },
          ],
        },
      ],
      "/components/": [
        {
          text: "Built-in Components",
          items: [
            { text: "Overview", link: "/components/overview" },
            { text: "Router", link: "/components/router" },
            { text: "Form", link: "/components/form" },
            { text: "Table", link: "/components/table" },
            { text: "Select", link: "/components/select" },
            { text: "Virtual List", link: "/components/list" },
          ],
        },
        {
          text: "Integration",
          items: [
            { text: "Component Libraries", link: "/components/libraries" },
            { text: "Web Components", link: "/components/web-components" },
            { text: "JSX Support", link: "/components/jsx" },
            { text: "Vue Templates", link: "/components/vue-templates" },
          ],
        },
      ],
      "/advanced/": [
        {
          text: "Core Patterns",
          items: [
            { text: "Type Composition", link: "/advanced/type-composition" },
            { text: "Auto Create Entities", link: "/advanced/auto-create" },
          ],
        },
        {
          text: "Development",
          items: [
            { text: "Testing", link: "/advanced/testing" },
            { text: "Error Handling", link: "/advanced/error-handling" },
            { text: "Performance", link: "/advanced/performance" },
            { text: "Redux DevTools", link: "/advanced/devtools" },
          ],
        },
        {
          text: "Advanced Topics",
          items: [
            { text: "SSX & Static Sites", link: "/advanced/ssx" },
            { text: "Engine Integration", link: "/advanced/engine" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [{ text: "Complete Reference", link: "/api/reference" }],
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
