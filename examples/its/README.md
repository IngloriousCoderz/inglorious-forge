# IngloriousScript with TypeScript

This directory demonstrates how to use **[IngloriousScript](https://www.npmjs.com/package/@inglorious/babel-plugin-inglorious-script)** with TypeScript.

This playground demonstrates:

- How to configure Vite, Babel, and TypeScript to work together with IngloriousScript
- How to write type-safe game logic using vector operator overloading
- How to configure your editor for `.its` file syntax highlighting
- How TypeScript prevents vector operations on plain arrays

## What is IngloriousScript?

IngloriousScript is a superset of JavaScript that enables intuitive vector math using standard operators.

```typescript
// Instead of this:
const newPosition = mod(add(position, scale(velocity, dt)), worldSize)

// You can write this:
// @ts-expect-error - IngloriousScript operators
const newPosition = (position + velocity * dt) % worldSize
```

## Getting Started

This playground is part of the Inglorious Forge monorepo.

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone https://github.com/IngloriousCoderz/inglorious-forge.git
   cd inglorious-forge
   ```

2. **Install dependencies** from the root of the project:

   ```bash
   pnpm install
   ```

3. **Run the playground**:

   ```bash
   pnpm --filter its dev
   ```

This will start a Vite development server. Open your browser to the local URL provided to see it in action.

## Project Setup

#### vite.config.js

We use `vite-plugin-babel` to transform IngloriousScript syntax. The `.its` extension is included in the filter:

```javascript
export default defineConfig({
  plugins: [
    babel({
      include: /[\\/]src[\\/].*\.(js|ijs|ts|its)$/,
      babelConfig: {
        presets: [
          "@inglorious/inglorious-script",
          [
            "@babel/preset-typescript",
            {
              ignoreExtensions: true,
              onlyRemoveTypeImports: true,
            },
          ],
        ],
      },
    }),
  ],
})
```

#### tsconfig.json

TypeScript is configured to recognize `.its` files and allow arbitrary extensions:

```json
{
  "compilerOptions": {
    "allowArbitraryExtensions": true
    // ... other options
  }
}
```

#### src/script.its

This is where the game logic lives. We use the `.its`(IngloriousScript TypeScript) extension for files that combine TypeScript's type safety with IngloriousScript's vector operators.

**Important:** Since TypeScript doesn't natively support operator overloading, you'll need to add `@ts-expect-error` comments before vector operations:

```typescript
// @ts-expect-error - IngloriousScript operators are transformed by Babel
const newPosition = (position + velocity * deltaTime) % worldSize
```

This is expected and normal for `.its` files. The comment tells TypeScript "yes, I know this looks wrong, but Babel will transform it correctly."

#### Type Safety

You get full TypeScript type checking for:

- Variable declarations
- Function signatures
- Type inference
- IDE autocomplete

The only place you need `@ts-expect-error` is on the actual operator expressions.

### Editor Configuration (VS Code)

This playground comes with a pre-configured `.vscode/settings.json` file that tells Visual Studio Code to treat `.its` files as TypeScript:

```json
{
  "files.associations": {
    "*.its": "typescript"
  }
}
```

This gives you TypeScript syntax highlighting and IntelliSense for `.its` files.

#### Why .its instead of .ts?

The `.its` extension clearly signals that these files use IngloriousScript operators. It sets the right expectation that `@ts-expect-error` comments are normal and intentional, not a workaround.

#### Comparison with .ijs

- **`.ijs` files:** Pure JavaScript with IngloriousScript operators. No type annotations, no TypeScript checking.
- **`.its` files:** TypeScript with IngloriousScript operators. Full type safety with `@ts-expect-error` on operator expressions.

Choose `.ijs` for pure JavaScript projects, and `.its` when you want TypeScript's type safety.

### Troubleshooting

If you find that VS Code is not recognizing the global `v()` function, it might be because the TypeScript server hasn't loaded the global type definitions yet. A simple workaround is to open the `node_modules/@inglorious/babel-plugin-inglorious-script/types/globals.d.ts` file in your editor. This action typically prompts the TypeScript server to discover and load the global types, which should resolve the issue.
