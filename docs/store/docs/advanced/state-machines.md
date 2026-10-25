---
title: State Machines
description: Give entities states that change how they answer events, with fsm and scenes.
---

# State Machines

Some entities answer the same event differently depending on the state they are in: a door opens when it is closed and does nothing when it is locked, and a form submits when it is valid but not while it is already saving. Writing that as `if (entity.status === ...)` in every handler spreads one decision over many places.

`fsm()` gathers it in one place instead. It turns a type into a finite state machine in the manner of the OOP State pattern: each state says what it answers, and the entity's `state` field says which state is in charge.

## `fsm`

```javascript
import { fsm } from "@inglorious/store/fsm"

const types = {
  Door: [
    {
      // What every state does, unless a state says otherwise
      knock(entity) {
        entity.knocks++
      },
    },
    fsm({
      closed: {
        open(entity) {
          entity.state = "open"
        },
        lock(entity) {
          entity.state = "locked"
        },
      },
      open: {
        close(entity) {
          entity.state = "closed"
        },
      },
      locked: {
        // Takes over knock while locked
        knock(entity, _, api) {
          api.notify("bark")
        },
        unlock(entity) {
          entity.state = "closed"
        },
      },
    }),
  ],
}

const entities = { door: { type: "Door", state: "closed", knocks: 0 } }
```

### How a state answers

- A state's handler **replaces** the type's handler for the same event. The type's handler is therefore the default — what every state does — and a state takes it over by naming the event.
- An event that neither the current state nor the type answers is ignored. Above, `open` does nothing while the door is locked.
- `fsm()` is a decorator, so put it after the behaviors whose handlers it should fall back to.

### Moving between states

A handler moves the entity by assigning `entity.state`. An entity that starts without a `state` is put in `"default"`, so a machine can be written without naming its first state:

```javascript
const Cat = fsm({
  default: {
    meow(entity) {
      entity.state = "purring"
    },
  },
  purring: {},
})
```

### `stateChange`

When a handler has actually moved the entity, `fsm()` broadcasts `stateChange` with `{ entityId, from, to }`. A handler that reads the state without changing it announces nothing.

The event is broadcast rather than addressed to the entity, because what wants to hear it is usually something else, so a listener checks `entityId`:

```javascript
const types = {
  Analytics: {
    stateChange(entity, { entityId, from, to }) {
      if (entityId !== "checkout") return
      entity.funnel.push({ from, to })
    },
  },
}
```

## `scenes`

`scenes()` is the usual partner of `fsm()`: the machine says when it moves, and `scenes()` says which entities stand in each state.

```javascript
import { fsm } from "@inglorious/store/fsm"
import { scenes } from "@inglorious/store/scenes"

const types = {
  Wizard: [
    scenes({
      account: () => [{ id: "accountForm", type: "AccountForm" }],
      billing: (wizard) => [
        { id: "billingForm", type: "BillingForm", plan: wizard.plan },
      ],
    }),
    fsm({
      account: {
        next(entity) {
          entity.state = "billing"
        },
      },
    }),
  ],
}

const entities = { wizard: { type: "Wizard", state: "account", plan: "pro" } }
```

Each state is a function of the entity running the machine, returning the entities to have standing. On `create`, and on its own `stateChange`, `scenes()` compares them by `id` with what the previous state had up:

- what only the new state has is `add`ed;
- what only the old state had is `remove`d;
- what both have is left standing, and `patch`ed with whatever the new state configures differently.

That last rule is what lets two states share part of the world without rebuilding it, so whatever happened to a shared entity in one state survives the move into the next. The entity running the machine keeps what it has up in `scene`.

### Scenes outside games

The name comes from games, where each screen is a scene, but nothing about it is game-specific. In a web app it gives entities a lifetime tied to a state:

- **Page-scoped entities.** A page's forms and lists exist only while you are on it. Their `create` and `destroy` can open and close subscriptions, and coming back starts them fresh.
- **Wizard steps.** Each step has its own form entity, while what the steps share is patched rather than rebuilt.
- **Auth and modes.** A logged-out app has a `loginForm` that a logged-in one does not; an edit mode can bring its editor entities along.

Anything both states share, like a header or a cart, survives the move untouched.

## TypeScript

`fsm` and `scenes` take the entity and the api from where they are used, so in a typed store their handlers need no annotations. Declaring `state` on the entity's interface also checks the state names, in both the states object and the assignments:

```typescript
interface DoorEntity extends BaseEntity {
  type: "Door"
  state: "closed" | "open" | "locked"
  knocks: number
}

const store = createStore<AppEntity, AppState>({
  types: {
    Door: [
      Door,
      fsm({
        closed: {
          open(entity) {
            entity.state = "open" // "ajar" would be an error
          },
        },
        // ajar: {} would be an error too
      }),
    ],
  },
  entities,
})
```

Outside a store, pass them explicitly: `fsm<DoorEntity, AppApi>({ ... })`. A listener can type the payload with `StateChangePayload` from `@inglorious/store/fsm`.

## When to use it

- request and connection status: idle, loading, failed, connected, reconnecting;
- multi-step flows: wizards, checkouts, onboarding;
- editors that are viewing, editing or saving;
- media players, drag and drop, anything with modes;
- the screens of a game, which is where it comes from — see [Inglorious Engine](https://inglorious.dev/engine).
