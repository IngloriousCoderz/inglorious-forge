# @inglorious/create-game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official scaffolding tool to quickly create a new game with the [Inglorious Engine](https://www.npmjs.com/package/@inglorious/engine).

This package allows you to generate a new project from a set of pre-configured templates, so you can start developing your game right away.

## Usage

To create a new game, run one of the following commands in your terminal. You will be prompted to choose a project name and select a template.

```bash
# with npm
npm create @inglorious/game@latest

# with yarn
yarn create @inglorious/game

# with pnpm
pnpm create @inglorious/game
```

The CLI will guide you through the setup process, asking for a project name and which template you'd like to use.

Every template except `minimal` then asks whether to add agent skills. Saying yes runs the [skills CLI](https://skills.sh) in the new project. It asks which coding agents to install for, and installs the [Inglorious Forge skills](https://github.com/IngloriousCoderz/forge-skills) for games: `forge`, `forge-best-practices`, `store`, `utils`, `engine` and `engine-best-practices`. If the install fails, the CLI prints the command to retry it.

## Templates

The following templates are available to get you started:

- **minimal**: A minimal starter template that requires no bundling: just HTML, CSS, and JS.
- **js**: A starter template for a plain JavaScript project, bundled with Vite.
- **ts**: A starter template for a plain TypeScript project, bundled with Vite.
- **ijs** (IngloriousScript): A starter template for a JavaScript project using IngloriousScript, bundled with Vite.
- **its** (IngloriousScript w/ TypeScript): A starter template for a TypeScript project that uses IngloriousScript, bundled with Vite.

## What it does

The tool will create a new directory with your chosen project name and copy the template files into it. It will also automatically update the `package.json` with your project's name.

After the project is created, you can navigate into the directory and install the dependencies.

```bash
# 1. Change into your new project directory
cd my-awesome-game

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

## License

**MIT License - Free and open source**

Created by [Matteo Antony Mistretta](https://github.com/IngloriousCoderz)

You're free to use, modify, and distribute this software. See [LICENSE](./LICENSE) for details.
