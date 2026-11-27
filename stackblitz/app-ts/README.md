# Inglorious App (TypeScript)

> Running on StackBlitz with the latest published packages, and the Inglorious agent skills installed for coding agents. To start a project of your own, run `pnpm create @inglorious/app --template=ts`.

This project is a minimal starter template for creating an app with the Inglorious Web framework using TypeScript, bundled with Vite.

## Getting Started

This project was scaffolded with `@inglorious/create-app`.

To get started, follow these steps:

1.  **Install dependencies**:
    Navigate to your project directory and install the required packages.
    ```sh
    npm install
    ```
2.  **Start the development server**:
    Run the following command to start the Vite development server.
    ```sh
    npm run dev
    ```

This will start a Vite development server. Open your browser to the local URL provided to see it in action.

## Project Setup

- `index.html`: The main entry point for your app.
- `src/`: Contains your app's TypeScript source code.
- `types/`: Type declarations for your app's entities, state and types.
- `vite.config.ts`: Vite configuration file.
- `tsconfig.json`: TypeScript configuration for the project.
- `package.json`: Project metadata and dependencies.

Imports from outside a file's folder start with `@/`, which points to `src/` (`@/store`); imports from the same folder or below stay relative (`./message`). Type declarations come from `#types` (`import type { AppState } from "#types"`), which the `imports` field of `package.json` points to `types/index.d.ts`.
