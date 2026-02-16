# web-motion

Demo app showcasing the new `@inglorious/motion` package with native `@inglorious/web` type composition.

This app demonstrates:

- Variant transitions (`visible` / `hidden`) driven by store events.
- Motion phase classes (`start`, `active`, `end`) on the host node.
- Exit animation before removal via `api.notify(#id:removeWithMotion)`.

Quick start:

```bash
# from repository root
cd examples/apps/web-motion
pnpm install
pnpm dev
```
