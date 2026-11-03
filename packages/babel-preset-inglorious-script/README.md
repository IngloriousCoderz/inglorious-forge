# @inglorious/babel-preset-inglorious-script

[![npm version](https://img.shields.io/npm/v/@inglorious/babel-preset-inglorious-script.svg)](https://www.npmjs.com/package/@inglorious/babel-preset-inglorious-script)

This package is the official Babel preset for **IngloriousScript**.

It provides a convenient way to enable vector operator overloading by including the [`@inglorious/babel-plugin-inglorious-script`](../babel-plugin-inglorious-script/README.md) plugin.

## Installation

First, install the preset using your package manager:

```bash
pnpm add -D @inglorious/babel-preset-inglorious-script
```

## Usage

Add the preset to your Babel configuration file (e.g., `.babelrc.json`).

```json
{
  "presets": ["@inglorious/inglorious-script"]
}
```

Babel will automatically resolve `@inglorious/inglorious-script` to `@inglorious/babel-preset-inglorious-script`.

### What is IngloriousScript?

IngloriousScript is a superset of JavaScript that allows you to use intuitive arithmetic operators (`+`, `-`, `*`, `/`, etc.) for vector math.

```javascript
// Before
const newPosition = mod(add(position, scale(velocity, dt)), worldSize)

// After (with IngloriousScript)
const newPosition = (position + velocity * dt) % worldSize
```

For a complete guide on features, supported operators, and advanced usage, please see the documentation for the **[`@inglorious/babel-plugin-inglorious-script`](https://www.npmjs.com/package/@inglorious/babel-plugin-inglorious-script)** package.
