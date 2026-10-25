# Contributing to Inglorious Forge

First off, thank you for considering contributing to Inglorious Forge! It's people like you that make open source great. We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving the documentation, your help is appreciated.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please check the issues on GitHub to see if it has already been reported. If not, please open a new issue. Be sure to include a clear title, a detailed description of the problem, and steps to reproduce it if possible.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, feel free to open an issue to discuss it. This allows us to coordinate our efforts and prevent duplication of work.

### Pull Requests

We love pull requests! If you're ready to contribute code, here's how to do it:

1.  Fork the repository and create your branch from `main`.
2.  Make your changes and add tests for any new functionality.
3.  Ensure the test suite passes (`pnpm test`).
4.  Run `pnpm format` and `pnpm lint` before every commit, and fix what they report in the files you touched -- warnings included, not only errors. The project uses Prettier for formatting and ESLint for linting. The pre-commit hook formats and lints the files you stage, fixing what it can and refusing the commit while any warning is left, so never commit with `--no-verify`. A new workspace needs an `eslint.config.js` and a `"lint": "eslint ."` script, or `pnpm lint` skips it.
5.  Issue that pull request!

## Development Setup

1.  Fork and clone the repository.
2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```
3.  Run the Storybook documentation locally:
    This will start the Storybook server, which is the primary development environment for the engine's components and documentation.
    ```bash
    pnpm --filter @inglorious/docs storybook
    ```
4.  Run the linter to check for code style issues:
    ```bash
    pnpm lint
    ```
5.  Run the unit tests to ensure everything is working as expected:
    ```bash
    pnpm test
    ```

## Code Style

### Name your numbers

A bare number in the middle of the code says how much but not why. Give it a name, as a constant on top of the file, right below the imports:

```js
const ONE_SECOND = 1
const NO_TIME_PASSED = 0

export function dueAt(interval) {
  return function isDue(clock, dt) {
    const since = clock + dt
    if (since < interval) return { since }
    return { elapsed: since, since: NO_TIME_PASSED }
  }
}
```

ESLint's `no-magic-numbers` rule warns about the ones you miss. Tests and Storybook stories are exempt: there a number is the example, and naming it would only hide it.

Name a number after what it means, not after its value. `ONE_SECOND` is better than `ONE`, and two constants that both happen to be `0` -- `NO_TIME_PASSED` and `FIRST_ROW` -- stay two constants, because they would change for different reasons.

#### Vectors

Vector components are the exception. Instead of creating a constant for each vector index:

```js
const X = 0
const Y = 1
const Z = 2

const x = entity.position[X]
const y = entity.position[Y]
const z = entity.position[Z]
```

We find it cleaner to use array destructuring, like so:

```js
const [x, y, z] = entity.position
```

There are a few exceptions: in the `/docs` folder we prefer the first version because not everyone is used to destructuring and we wanted to make the examples as readable as possible for people coming from, say, Godot. In that case we would put the `X`, `Y`, and `Z` constants on top of the file, right below the imports, so that they can be used throughout the whole game file.

### The Newspaper Metaphor

A file should read like a newspaper: the headline first, the details later. Opening `form.js` should show `Form` first, not `validate()` or `parseRegex()` or whatever private function happens to support it. From the top down, a module is laid out as:

1. its imports;
2. its constants;
3. what it exports -- the headline;
4. the support functions the exports use -- the details.

```js
import { html } from "lit-html"

const STEP = 0.01

// The headline: what this file is about.
export const BeforeAfter = {
  render(props) {
    return this.renderBeforeAfter(props)
  },
  // ...
}

// The details: support functions live below.
function positionFromEvent(event) {
  // ...
}
```

The order among the exports themselves is free: when none of them supports another, alphabetical is a good default.

This works because function declarations hoist: an export can call a support function defined further down, even while the module is still loading -- `export const setFPS = withPayload("setFPS")` is fine with `withPayload` at the bottom. Arrow functions assigned to a `const` do not hoist, so write support functions as `function` declarations. A `const` that has to exist before the exports run, such as a default value, stays with the constants on top.

### Define functions once

Anything that doesn't depend on the arguments of a render function belongs outside of it, otherwise it gets redefined on every single render:

```js
// No ties to props, so it lives at module scope.
function handlePointerUp(event) {
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}
```

When a handler does need something from the render function, curry it instead of moving the whole body back inside:

```js
function handleKeyDown(props) {
  return (event) => {
    // ...
    props.onPositionChange?.(clamp(next))
  }
}
```

### Don't pass what you can derive

If an argument can always be obtained from another one, it is redundant. Let the function figure it out:

```js
// Redundant: the second argument is always event.currentTarget.
positionFromEvent(event, event.currentTarget)

// Better.
positionFromEvent(event)
```

### Keep imports sorted

Imports and re-exports are sorted, and [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort) enforces it: run `npx eslint --fix` on the files you touched rather than ordering them by hand.

### Name files and folders in kebab-case

Every file and every folder: `keys-per-state.js`, `infinite-scroll.js`, `data-structures/`. Names are always **kebab-case**, never camelCase and never snake_case.

This is a rule about _paths_, not about the things inside them. A file may export a camelCase name and should, since that is what reads at the import site:

```javascript
// the file is kebab-case, the thing it exports is not
import { someModule } from "@inglorious/package/some-folder/some-module.js"
```

The two are kept apart on purpose. A path is looked up by machine and by tooling -- globs, import maps, bundler resolution -- and one spelling for it keeps all of that agreeing. A name is read by a person, and camelCase reads better at the call site. See also [Keep lists alphabetical](#keep-lists-alphabetical) for what goes _inside_ a file.

## Component Conventions

These apply to `@inglorious/web` and `@inglorious/ui` components.

### Name event handlers after their events

Imagine every handler is silently prefixed with `on`. Name it after the event it reacts to, not after the action it performs: `(on)positionChange` reads well, `(on)setPosition` does not.

```js
// The handler, the event, and the prop all share one name.
export function positionChange(entity, position) {
  /* ... */
}
// notified as `#${id}:positionChange`, exposed to templates as `onPositionChange`
```

### Entities hold data, not functions

Entities live in the store and must stay serializable, so never put callbacks on them. Components turn interactions into notifications in their `render(entity, api)` bridge, and we like to keep those as one-liners (see `data-grid/index.js`):

```js
const props = {
  ...entity,
  onPositionChange: (position) => api.notify(`#${id}:positionChange`, position),
}
```

### Split complex components into sub-renders

Flexibility comes from overridability: a developer should be able to replace one piece of a component without rewriting it. Complex components expose a main `render` that delegates to a base renderer, which is composed of smaller `renderSomething` sub-renders (see `data-grid/template.js`):

```js
export const BeforeAfter = {
  render(props) {
    return this.renderBeforeAfter(props)
  },

  renderBeforeAfter(props) {
    return html`<div>${this.renderDivider?.(props)}</div>`
  },

  renderDivider(props) {
    return html`<div>${this.renderHandle?.(props)}</div>`
  },

  renderHandle() {
    return html`<div class="iw-before-after-handle"></div>`
  },
}
```

Call sub-renders with `?.` so that overrides can also remove a piece entirely.

### Only use `autoCreateEntities` when you need it

The flag creates an entity for every registered type, using `toCamelCase(typeName)` as its id. It is useful when you don't want to define entities by hand — if you already define them explicitly, the flag is just noise.

### Wrap components to give them app state

In apps and examples, don't hardcode an entity's initial state next to the store. Wrap the UI component in a type that adds its behavior and initial state, the way `AppDrawer` wraps Inglorious UI's `Drawer`:

```js
export const AppDrawer = {
  create(entity) {
    entity.items ??= getDefaultItems()
  },
  // ...behavior, then render() delegating to Drawer
}
```

### Prefer consistency over local improvements

A pattern that only one component follows is worse than no pattern at all. If something is worth doing, do it for every comparable component; otherwise leave it out and open an issue instead.

### Examples mirror their source

The admin dashboard example is a copy of [CoreUI](https://coreui.io/)'s dashboard, so it only contains what that dashboard has. Components are documented in their own stories — that's the place to showcase them, not the examples.
