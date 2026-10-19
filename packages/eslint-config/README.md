# `@inglorious/eslint-config`

Shared ESLint configs for Inglorious Forge projects, as flat configs:

| Entry point                            | For                                                    |
| -------------------------------------- | ------------------------------------------------------ |
| `@inglorious/eslint-config/base`       | Any project: recommended rules and sorted imports      |
| `@inglorious/eslint-config/browser`    | Browser code                                           |
| `@inglorious/eslint-config/node`       | Node code                                              |
| `@inglorious/eslint-config/typescript` | TypeScript, with `@typescript-eslint`                  |
| `@inglorious/eslint-config/react`      | JSX and React, with `eslint-plugin-react`              |
| `@inglorious/eslint-config/tailwind`   | Tailwind CSS classes, with `eslint-plugin-tailwindcss` |
| `@inglorious/eslint-config/storybook`  | Storybook stories                                      |

```js
// eslint.config.js
import browserConfig from "@inglorious/eslint-config/browser"

export default browserConfig
```

The plugins are peer dependencies, which pnpm installs for you. `eslint-plugin-tailwindcss` is optional: install it yourself to use the `tailwind` config.

`no-magic-numbers` is off in tests (`*.test.*`, `*.spec.*`) and stories.
