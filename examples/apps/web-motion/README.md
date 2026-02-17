# web-motion

Demo app showcasing the new `@inglorious/motion` package with native `@inglorious/web` type composition.

This app demonstrates:

- Variant transitions (`visible` / `hidden`) driven by store events.
- Presence groups in `wait` mode via `api.notify(#id:removeWithMotion)`.
- Layout FLIP transitions when reordering cards.
- Shared layout (`motionLayoutId`) transitions between compact/expanded views.

Quick start:

```bash
# from repository root
cd examples/apps/web-motion
pnpm install
pnpm dev
```

Run Playwright E2E:

```bash
pnpm test:e2e
```

Open Playwright UI:

```bash
pnpm test:e2e:ui
```

If you want to actually watch the browser while tests run:

```bash
pnpm test:e2e:ui:headed
```
