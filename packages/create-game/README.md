# @inglorious/create-game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official scaffolding tool to quickly create a new game with the [Inglorious Engine](https://www.npmjs.com/package/@inglorious/engine).

Every template starts as a small, complete game: move with the arrow keys, WASD, a gamepad or a finger, and collect coins before the time runs out. It shows types, entities, composed behaviors, events, collisions and text, so there is something to change from the first minute.

## Try it online

The `js` and `ts` templates run on StackBlitz, with nothing to install: open the [JavaScript](https://stackblitz.com/github/IngloriousCoderz/inglorious-forge/tree/main/stackblitz/game?file=src/game.js) or the [TypeScript](https://stackblitz.com/github/IngloriousCoderz/inglorious-forge/tree/main/stackblitz/game-ts?file=src/game.ts) one. Both come with the agent skills installed.

## Usage

```bash
pnpm create @inglorious/game
```

The CLI asks for:

1. The project name.
2. A template.
3. Whether to make the game an installable, offline-ready PWA.
4. Whether to ship it to the app stores, which adds Capacitor for Android and iOS, and then the app id.
5. Whether to add agent skills for coding agents.

The `minimal` template asks only the first two.

Flags answer the questions up front, so the CLI can run without prompts:

```bash
pnpm create @inglorious/game my-game --template=js --pwa --mobile --app-id=com.example.mygame --skills
```

| Flag                      | Answers                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `<name>`                  | The project name, and the folder it is created in                                  |
| `--template=<template>`   | `js`, `ts`, `ijs`, `its` or `minimal`                                              |
| `--app-name=<name>`       | The name players see; by default the project name in words (`my-game` → `My Game`) |
| `--pwa`, `--no-pwa`       | PWA support                                                                        |
| `--mobile`, `--no-mobile` | Capacitor for Android and iOS                                                      |
| `--app-id=<id>`           | The store id, a reverse domain such as `com.example.mygame`                        |
| `--skills`, `--no-skills` | Agent skills                                                                       |

## Templates

- **js**: JavaScript, bundled with Vite and tested with Vitest.
- **ts**: TypeScript, bundled with Vite and tested with Vitest. `pnpm typecheck` checks the types.
- **ijs** (IngloriousScript): JavaScript with vector math (`position += velocity * dt`), bundled with Vite and tested with Vitest.
- **its** (IngloriousScript with TypeScript): the same, in TypeScript.
- **minimal**: a single HTML file that loads the engine from a CDN through an import map, with no build step. Serve the folder (for example with `npx serve`), since browsers don't load modules from files opened directly.

## What it does

The CLI copies the template into a new folder, names the project and the page title, and sets every `@inglorious/*` dependency to its latest version. In the `minimal` template it pins the CDN URLs instead.

Every template but `minimal` also gets:

- `vite.config.js`, which Vitest reads too, with tests running in jsdom. It points `@/` to `src/`, so a file imports from outside its folder with `@/` (the tests import `@/game.js`) and from its own folder with `./`. `tsconfig.json` (or `jsconfig.json`) tells the editor the same.
- `pnpm-workspace.yaml`, so pnpm installs Inglorious packages on the day they are published.
- `.github/dependabot.yml`, for weekly dependency updates grouped into two pull requests.
- A `vercel.json` that deploys only the `main` branch on Vercel; change `main` there if your production branch has another name.

### PWA

The game gets [vite-plugin-pwa](https://vite-pwa-org.netlify.app/): the build makes the icons from `public/logo.png`, a manifest that opens the game fullscreen, and a service worker that caches it for offline play and updates it in the background.

### Mobile

The game gets [Capacitor](https://capacitorjs.com/) and [@inglorious/capacitor](https://www.npmjs.com/package/@inglorious/capacitor), set up as in [create-app](https://inglorious.dev/create-app/): `pnpm mobile:init:android` and `pnpm mobile:init:ios` create the native projects, `pnpm mobile:dev:android` and `pnpm mobile:dev:ios` run the game on a device with live reload, and `pnpm mobile:release` prepares a store build. The project's README lists the native tools each platform needs. With PWA support too, the service worker stays off inside the native app.

### Agent skills

Saying yes runs the [skills CLI](https://skills.sh) in the new project. It asks which coding agents to install for, and installs the [Inglorious Forge skills](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/docs/forge/.well-known/agent-skills) for games: `forge`, `forge-best-practices`, `store`, `utils`, `engine` and `engine-best-practices`. If the install fails, the CLI prints the command to retry it. The StackBlitz versions of the `js` and `ts` templates come with the same skills installed: in `.agents/skills` and `.claude/skills`, and listed in `.bolt/prompt` for Bolt.

## After scaffolding

```bash
cd my-game
pnpm install
pnpm dev
```

`pnpm test` runs the game's tests, `pnpm build` builds it into `dist/`.

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
