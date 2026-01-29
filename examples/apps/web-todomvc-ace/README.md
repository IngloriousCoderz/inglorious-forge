# web-todomvc-ace

A client-only TodoMVC demo implemented using `@inglorious/web`. This example shows the usage of the `autoCreateEntities` config option, which automatically creates entities for every type that doesn't have an entity specified already.

## Component Organization

This demo uses a simpler, single-file approach where each component (form, list, footer) is defined in a single file containing both the type definition and render function. An `init`event handler initializes the entity.

Quick start:

```bash
cd examples/apps/web-todomvc-ace
pnpm install
pnpm dev
```

Files of interest:

- `src/form/form.js` — form component (type definition + render)
- `src/list/list.js` — list component (type definition + render)
- `src/footer/footer.js` — footer component (type definition + render)
- `src/store/` — store configuration
