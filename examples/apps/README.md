# Example apps index

This folder contains small demo apps that showcase features of the Inglorious Forge packages. Each demo has a short README and Vite-based dev workflow.

Available demos:

- [react-todomvc](./react-todomvc/README.md) — React TodoMVC demo
- [react-todomvc-cs](./react-todomvc-cs/README.md) — React TodoMVC + json-server demo
- [react-todomvc-rt](./react-todomvc-rt/README.md) — React TodoMVC + runtime/mock-api demo
- [react-todomvc-rtk](./react-todomvc-rtk/README.md) — React TodoMVC using RTK slices via Inglorious migration adapters
- [react-todomvc-ts](./react-todomvc-ts/README.md) — React TodoMVC in TypeScript
- [web-form](./web-form/README.md) — form type demo (validation, arrays, field helpers)
- [web-list](./web-list/README.md) — virtualized list demo (extends `list` and uses `renderItem`)
- [web-logo](./web-logo/README.md) — interactive logo manipulation
- [web-router](./web-router/README.md) — router demo (entity based client-side routing)
- [web-select](./web-select/README.md) — select type demo (single selection, multi, remote options)
- [web-todomvc](./web-todomvc/README.md) — TodoMVC client-only demo with `@inglorious/web` (start here!)
- [web-todomvc](./web-todomvc-ace/README.md) — TodoMVC client-only demo with the `autoCreateEntities` flag on
- [web-todomvc-cs](./web-todomvc-cs/README.md) — TodoMVC client-server demo with `@inglorious/web` and json-server
- [web-todomvc-jsx](./web-todomvc-jsx/README.md) — TodoMVC client-only demo in JSX with `@inglorious/web`
- [web-todomvc-ts](./web-todomvc-ts/README.md) — TodoMVC client-only demo in TypeScript with `@inglorious/web`
- [web-todomvc-tsx](./web-todomvc-tsx/README.md) — TodoMVC client-only demo in TSX with `@inglorious/web`

Quick start (from repo root):

```bash
cd examples/apps/<demo-name>
pnpm install
pnpm dev
```

For client-server demos, start the API server in another terminal:

```bash
pnpm api
```

Open the provided README inside each demo for more details.
