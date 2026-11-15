---
name: ui-best-practices
description: Prop naming and semantics for @inglorious/ui primitives.
---

# UI Best Practices

- Booleans are `isX`/`hasX`/`canX`; DOM booleans map in the template (`isDisabled` → `disabled`). No bare adjectives (`square`, `compact`, `ghost`) unless they are string variants.
- Corners: `radius="none|sm|md|lg|full"`, never `isSquare`.
- Several shapes: a `shape` enum (`square|rectangle|circle|pill`). Outlines: `border`/`ring` props.
- Layout primitives (`container`, `flex`, `grid`, `stack`) take `padding="none|sm|md|lg"` with a responsive default; no `gutterless` flags.
- Layout wrappers take an `element` prop for the tag; single-tag primitives keep theirs (`list` is a `ul`).
- Props map to token classes in the template: `radius="none"` → `iw-*-radius-none`.
