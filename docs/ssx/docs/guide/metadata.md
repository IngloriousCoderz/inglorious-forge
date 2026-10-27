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
