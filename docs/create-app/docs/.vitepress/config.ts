import { defineConfig } from "vitepress"

export default defineConfig({
  title: "Inglorious Create App",
  description:
    "One command to a web app, a PWA and native Android and iOS apps, with sign-in, push, updates and store releases already wired.",

  base: "/create-app/",

  head: [["meta", { name: "theme-color", content: "#3c3c3c" }]],

  themeConfig: {
    logo: "/transparent.png",
    siteTitle: "Create App",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Features", link: "/features/ui" },
      { text: "Mobile", link: "/mobile/overview" },
      { text: "Backend", link: "/backend/services" },
      { text: "Reference", link: "/reference/options" },
      { text: "Comparison", link: "/guide/comparison" },
      { text: "Inglorious Web", link: "https://inglorious.dev/web/" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is Create App?", link: "/guide/what-is" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Templates and Syntaxes", link: "/guide/templates" },
          { text: "Project Structure", link: "/guide/project-structure" },
          { text: "Versions and Releases", link: "/guide/releases" },
          { text: "Comparison", link: "/guide/comparison" },
        ],
      },
      {
        text: "App Features",
        items: [
          { text: "UI, Themes and Icons", link: "/features/ui" },
          { text: "Routing and Transitions", link: "/features/routing" },
          { text: "Translations", link: "/features/i18n" },
          { text: "Sign-in", link: "/features/auth" },
          { text: "Analytics", link: "/features/analytics" },
          { text: "Push Notifications", link: "/features/push" },
          { text: "PWA", link: "/features/pwa" },
          { text: "Agent Skills", link: "/features/skills" },
        ],
      },
      {
        text: "Mobile",
        items: [
          { text: "Overview", link: "/mobile/overview" },
          { text: "Native Settings", link: "/mobile/native-settings" },
          { text: "Live Reload on a Device", link: "/mobile/live-reload" },
          { text: "Icons and Splash Screens", link: "/mobile/assets" },
          { text: "Opening Links in the App", link: "/mobile/app-links" },
          { text: "Native Features", link: "/mobile/native-features" },
          { text: "App Updates", link: "/mobile/updates" },
          { text: "Releasing to the Stores", link: "/mobile/releasing" },
          { text: "Cloud Builds", link: "/mobile/ci" },
          { text: "Store Requirements", link: "/mobile/store-requirements" },
          { text: "Store Listing Images", link: "/mobile/listing-assets" },
        ],
      },
      {
        text: "Backend",
        items: [
          { text: "Services It Uses", link: "/backend/services" },
          { text: "Bring Your Own Backend", link: "/backend/bring-your-own" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Options", link: "/reference/options" },
          { text: "Scripts", link: "/reference/scripts" },
        ],
      },
    ],

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
})
