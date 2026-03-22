# ui-virtualized-list

A tiny demo that shows the `productList` example — a virtualized list implementation that extends the `virtualList` type from `@inglorious/ui/virtual-list` and provides `renderItem` for domain-specific item rendering.

Quick start:

```bash
# from repository root
cd examples/apps/ui-virtualized-list
pnpm install
pnpm dev
```

Open the app in your browser (Vite normally serves at http://localhost:5173) and inspect `src/product-list/product-list.js` and `src/store/entities.js` for the implementation and how the `virtualList` type is wired.
