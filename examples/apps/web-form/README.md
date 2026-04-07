# web-form

Invoice-style form performance demo built on `@inglorious/web` and `@inglorious/ui`.

Quick start:

```bash
# from repository root
cd examples/apps/web-form
pnpm install
pnpm dev
```

Files of interest:

- `src/invoice-form/index.js` — the invoice form, row rendering, and live totals
- `src/main.js` — UI theme and component style imports
- `src/store/entities.js` — seeds the form with 100 line items
