# web-components-ssx

A demo showing how Material Web components work with SSX's server-side rendering.

## The Solution

Material Web components (built with Lit) work with SSX by using:

1. **Declarative Shadow DOM** - SSR renders `<template shadowroot="open">` for shadow roots
2. **`defer-hydration` attribute** - Inner elements have this attribute to signal they shouldn't re-render
3. **`@lit-labs/ssr-client/lit-element-hydrate-support.js`** - Must be loaded BEFORE any Lit components to enable hydration

SSX automatically includes `lit-element-hydrate-support.js` in the generated client app.

## What Works

- `md-filled-button`
- `md-outlined-button`
- `md-switch`
- `md-filled-text-field`

## What Doesn't Work

**Shoelace** components access `this.host.childNodes` during render, which fails on the server. They don't have SSR support.

## Quick Start

```bash
cd examples/apps/web-components-ssx
pnpm install
pnpm dev
```

## How It Works

### Server-Side

1. Page imports Material Web components
2. Lit SSR renders them with Declarative Shadow DOM
3. HTML includes `<template shadowroot="open">` and `defer-hydration` attributes

### Client-Side

1. Browser parses HTML, creating shadow roots from declarative templates
2. `lit-element-hydrate-support.js` loads first
3. Custom elements upgrade, detect SSR'd shadow roots, skip re-render
4. Components become interactive without duplicating content
