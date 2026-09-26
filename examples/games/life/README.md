# life

This project is a starter template for creating a game with the Inglorious Engine using **IngloriousScript**.

## What is IngloriousScript?

IngloriousScript is a superset of JavaScript that enables intuitive vector math using standard operators, transformed by Babel.

```javascript
// Instead of this:
const newPosition = mod(add(position, scale(velocity, dt)), worldSize)

// You can write this:
const newPosition = (position + velocity * dt) % worldSize
```

## Getting Started

This project was scaffolded with `@inglorious/create-game`.

To get started, follow these steps:

1.  **Install dependencies**:
    Navigate to your project directory and install the required packages.
    ```sh
    pnpm install
    ```
2.  **Start the development server**:
    Run the following command to start the Vite development server.
    ```sh
    pnpm dev
    ```

This will start a Vite development server. Open your browser to the local URL provided to see it in action.

## Project Setup

- `index.html`: The main entry point for your game.
- `src/`: Contains your game's source code. Files ending in `.ijs` use IngloriousScript.
- `vite.config.js`: Vite configuration with the Babel plugin for IngloriousScript.
- `package.json`: Project metadata and dependencies.

## Editor Configuration (VS Code)

This template includes a `.vscode/settings.json` file that tells Visual Studio Code to treat `.ijs` files as JavaScript, enabling full syntax highlighting and IntelliSense.

```json
{
  "files.associations": {
    "*.ijs": "javascript"
  }
}
```
