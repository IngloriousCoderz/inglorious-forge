# @inglorious/create-game

## 1.4.1

### Patch Changes

- Give each entity type its own file in `src/types/` in the `ts` and `its` templates, with its TypeScript types in `types/` imported from `#types`, so the `its` template type-checks in the editor

## 1.4.0

### Minor Changes

- Point `@/` to `src/` in every scaffolded project, and use it for imports from outside a file's folder (`@/store` instead of `../store`). Imports from the same folder or below stay relative. TypeScript projects import their declarations from `#types`, which the `imports` field of `package.json` points to `types/index.d.ts`. JavaScript projects get a `jsconfig.json` so editors resolve `@/`, and `minimal` maps `@/` in its import map

### Patch Changes

- 45e960b: Mention in the README that the StackBlitz templates come with the agent skills installed
- 318f846: Link the StackBlitz versions of the `js` and `ts` templates from the README
- Updated dependencies
- Updated dependencies [45e960b]
- Updated dependencies [318f846]
  - @inglorious/create-app@1.32.0

## 1.3.0

### Minor Changes

- Scaffold a playable starter game with tests in every template, and offer PWA support, Capacitor for Android and iOS, and flags that answer every question (`--template`, `--app-name`, `--pwa`, `--mobile`, `--app-id`, `--skills`). The `minimal` template loads the engine from jsDelivr, pinned to the latest versions, and the `ts` template type-checks with `pnpm typecheck`.

### Patch Changes

- Updated dependencies
  - @inglorious/create-app@1.31.1

## 1.2.2

### Patch Changes

- 81d8e6f: Install the agent skills from `https://inglorious.dev`, which serves only the skill files, published from the monorepo where they now live beside the packages they describe.

## 1.2.1

### Patch Changes

- The templates' `vercel.json` skips branches with a slash in their name too (`dependabot/...`): `"**": false` instead of `"*": false`.

## 1.2.0

### Minor Changes

- Every template ships a `vercel.json` that deploys only the `main` branch, so pull requests and other branches don't use up Vercel's deployment limit. Change `main` there if your production branch has another name.

## 1.1.2

### Patch Changes

- New projects ignore the `skills` folder inside any root dot-folder (`.agents/skills/`, `.claude/skills/`, `.cursor/skills/` and so on), where the skills CLI installs agent skills. The rest of each agent folder, such as `.claude/settings.json`, can still be committed, and `skills-lock.json` stays tracked.

## 1.1.1

### Patch Changes

- Scaffold projects with pnpm 12.15.0 as their package manager, and TypeScript projects with Node 26 types

## 1.1.0

### Minor Changes

- Asks whether to add agent skills, and installs the Inglorious Forge skills for games with the skills CLI.

## 1.0.9

### Patch Changes

- Add TSX web todomvc example

## 1.0.8

### Patch Changes

- Add missing Vite preview scripts

## 1.0.7

### Patch Changes

- Fix ESLint not included and remove reactive selectors

## 1.0.6

### Patch Changes

- Add TS lint rules

## 1.0.5

### Patch Changes

- Fix game scaling on mobile devices

## 1.0.4

### Patch Changes

- Add eager mode by default on store

## 1.0.3

### Patch Changes

- Create react-store package

## 1.0.2

### Patch Changes

- Support eager and lazy loading of images

## 1.0.1

### Patch Changes

- Show spinner while scaffolding game

## 1.0.0

### Major Changes

- Create game scaffolding tool
