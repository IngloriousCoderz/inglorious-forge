# @inglorious/create-app - Complete Reference

## Installation

```bash
npm create @inglorious/app@latest
```

## Core Concept

Scaffolding tool for @inglorious/web and @inglorious/ssx projects. It creates a new project directory from a template and sets the `package.json` name.

**Default renderer:** lit-html (via @inglorious/web).

Optional template choices let you use different template syntaxes:

- **JSX/TSX** via `@inglorious/vite-plugin-jsx`
- **Vue-style templates** via `@inglorious/vite-plugin-vue`

## Usage

```bash
# npm
npm create @inglorious/app@latest

# yarn
yarn create @inglorious/app

# pnpm
pnpm create @inglorious/app
```

You’ll be prompted for the project name and template.

## Templates

- `minimal` — plain HTML/CSS/JS, no bundler
- `js` — Vite + JavaScript
- `ts` — Vite + TypeScript
- `ssx-js` — SSX + JavaScript
- `ssx-ts` — SSX + TypeScript

## After Creation

```bash
cd my-awesome-app
pnpm install
pnpm dev
```
