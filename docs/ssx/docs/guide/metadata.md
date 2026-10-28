---
title: "Metadata, Sitemap and RSS"
description: "Page titles and meta tags, and the feeds generated from them."
---

# Metadata, Sitemap and RSS

What a page says about itself goes in its `metadata`, which also feeds the sitemap and the RSS feed.

## Page Metadata

Export metadata for HTML `<head>`. The `metadata` export can be a plain object or a function:

```javascript
export const Index = {
  render() {
    return html`<h1>Home</h1>`
  },
}

// Static metadata
export const metadata = {
  title: "My Site",
  meta: {
    description: "An awesome static site",
    "og:image": "/og-image.png",
  },
}

// Or dynamic metadata (uses entity data)
export const metadata = (entity) => ({
  title: `${entity.user.name}'s Profile`,
  meta: {
    description: entity.user.bio,
    "og:image": entity.user.avatar,
  },
})
```

The server writes all of this into the HTML of each page. When the visitor then navigates on the client, SSX applies the new page's `title`, `meta` and `lang`, merged over the defaults in `src/site.config.js` the same way the server merges them. Values computed from entity data are applied once that data arrives. Only meta tags named by a page or the site config are touched; any others your layout writes stay as they are.

The document language comes from the page's `lang`, then from its locale on an [internationalized](./i18n.md) site, then from the `lang` in `src/site.config.js`, so screen readers pronounce each page in its own language. The `dir` of `<html>` follows that language, `rtl` for scripts such as Arabic and Hebrew, unless the page's `dir` says otherwise. A custom `layout` receives both as `lang` and `dir`, and should write them on `<html>`.

After each client-side navigation SSX also does what a full page load does for assistive technology, through the router's [accessible navigation](https://inglorious.dev/web/featured/router#accessible-navigation): it announces the new page title, once any data it depends on has arrived, and moves focus back to the top of the document. A link with `data-is-focus-kept` leaves focus where it is.

`styles`, `scripts` and `head` are applied by the server only, so they reflect the page the visitor landed on. Import page-specific CSS from the page module instead, and Vite will load it when the page does.

## Sitemap & RSS Generation

SSX automatically generates `sitemap.xml` and `rss.xml` based on your pages. Configure them in `src/site.config.js`:

```javascript
export default {
  // Basic metadata
  title: "My Awesome Site",
  meta: {
    description: "A site built with SSX",
    "og:type": "website",
    "og:site_name": "My Site",
  },

  // Sitemap configuration
  sitemap: {
    hostname: "https://myblog.com",
    filter: (page) => !["/admin", "/draft-*", "/test"].includes(page.pattern),
    defaults: {
      changefreq: "weekly",
      priority: 0.5,
    },
  },

  // RSS configuration
  rss: {
    title: "My Blog",
    description: "Latest posts from my blog",
    link: "https://myblog.com",
    feedPath: "/feed.xml",
    language: "en",
    copyright: "© 2026 My Blog",
    maxItems: 10,
    filter: (page) => page.path.startsWith("/posts/"),
  },
}
```

Pages with a `published` date in metadata are included in RSS feeds.
