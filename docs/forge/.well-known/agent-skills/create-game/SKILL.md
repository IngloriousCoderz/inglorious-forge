---
name: create-game
description: Scaffolding new Inglorious Engine game projects with create-game.
---

# @inglorious/create-game

```bash
pnpm create @inglorious/game my-game --template=js --pwa --mobile --app-id=com.example.mygame --skills
```

Without flags it prompts. Flags: `--template=js|ts|ijs|its|minimal`, `--app-name=`, `--pwa`/`--no-pwa`, `--mobile`/`--no-mobile`, `--app-id=` (reverse domain), `--skills`/`--no-skills`. `minimal` takes none but the template.

Every template is a playable coin-collecting game in `src/game.*` (in `ts` and `its`, each type has its own file in `src/types/` and its TypeScript types in `types/`, imported from `#types`; types, entities, `modernControls()`, `clamped()`, `findCollision`, `renderText`, keyboard, gamepad and touch input) with tests in `test/` using `createGame` from `@inglorious/engine/test.js`.

- `js`, `ts`, `ijs`, `its`: Vite and Vitest (jsdom); generated `vite.config.js`, which points `@/` to `src/` for imports across folders (the tests import `@/game.js`); `pnpm dev|test|build|lint`, `pnpm typecheck` in `ts`. `ijs`/`its` are IngloriousScript (see [engine](../engine/SKILL.md)).
- `minimal`: one `index.html` with a jsDelivr import map pinned to the latest versions; serve it, don't open it as a file.
- `--pwa`: vite-plugin-pwa, fullscreen manifest, auto-updating service worker in `src/pwa.*` (off inside Capacitor).
- `--mobile`: Capacitor and `@inglorious/capacitor` as in [create-app](../create-app/SKILL.md) (`mobile:*` scripts, `native` in `package.json`), plus Changesets for releases.
- Skills: `forge`, `forge-best-practices`, `store`, `utils`, `engine`, `engine-best-practices`.

Shares its helpers with create-app (`@inglorious/create-app/bin/lib/*`). Every template has a `vercel.json` deploying only `main`.
