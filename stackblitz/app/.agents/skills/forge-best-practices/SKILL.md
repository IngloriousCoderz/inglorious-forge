---
name: forge-best-practices
description: Code style for Inglorious Forge and projects in its style - kebab-case paths, named numbers, exports before support functions, types in types/. Load when writing, moving, or reviewing such code.
---

# Forge Best Practices

Package-specific rules: [web-best-practices](../web-best-practices/SKILL.md), [ui-best-practices](../ui-best-practices/SKILL.md), [engine-best-practices](../engine-best-practices/SKILL.md).

## Naming

- Every file and folder is kebab-case, components included. Exported names stay camelCase/PascalCase.
- Exempt: names a tool dictates (`README.md`, `CHANGELOG.md`, `SKILL.md`, `.storybook/`, SSX `_slug.js`/`__path.js`, `__snapshots__`).
- Booleans read as booleans: `isX`, `hasX`, `canX`.
- On rename, update every import and doc in the same change.

## Numbers

Name every number as a constant below the imports, after its meaning (`ONE_SECOND`, not `ONE`). Equal values with different meanings stay separate constants. Exempt: tests, stories, and vector components (destructure `const [x, y] = entity.position`).

## File layout

1. imports (sorted by `eslint --fix`)
2. constants
3. exports
4. support functions, as `function` declarations (they hoist; arrow `const`s don't)

Don't reorder existing exports. Move a function's doc comment with it.

## Types

Type definitions live in `types/*.d.ts`, one per subject, never in `.js`/`.ts` code. Import with `import type` or JSDoc `@typedef {import(...)}`. Keep `skipLibCheck` off unless a library's typings break. No code in `types/`.

## Comments

No comments that narrate, restate names or explain history. Keep only ones that stop a reader from undoing a non-obvious decision.

## Before committing

Run `pnpm format` and `pnpm lint` from the root and fix warnings in touched files. Never `--no-verify`. A new workspace needs an `eslint.config.js` and a `"lint": "eslint ."` script.
