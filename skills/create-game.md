# @inglorious/create-game - Complete Reference

## Installation

```bash
npm create @inglorious/game@latest
```

## Core Concept

Scaffolding tool for new games built with @inglorious/engine. It creates a new project directory from a template and sets `package.json` name.

## Usage

```bash
# npm
npm create @inglorious/game@latest

# yarn
yarn create @inglorious/game

# pnpm
pnpm create @inglorious/game
```

You’ll be prompted for the project name and template.

## Templates

- `minimal` — plain HTML/CSS/JS, no bundler
- `js` — Vite + JavaScript
- `ts` — Vite + TypeScript
- `ijs` — IngloriousScript + JavaScript (Vite)
- `its` — IngloriousScript + TypeScript (Vite)

## After Creation

```bash
cd my-awesome-game
pnpm install
pnpm dev
```
