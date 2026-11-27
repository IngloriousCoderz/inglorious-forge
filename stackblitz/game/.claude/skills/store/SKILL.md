---
name: store
description: "@inglorious/store: entity-based, Redux-compatible state - types, events, handleRequest, handleAsync, optimistic, withStorage, fsm, scenes, systems, middlewares, testing, TypeScript, RTK migration."
---

# @inglorious/store

Redux-compatible (react-redux, DevTools, `dispatch({ type, payload })`); prefer `notify`. Standalone, with [react-store](../react-store/SKILL.md), or under web/engine/server.

```javascript
import { createStore } from "@inglorious/store";

const types = {
  Tasks: {
    taskAdd(entity, text, api) {
      entity.items.push({ id: Date.now(), text });
      api.notify("taskCountChange", { count: entity.items.length });
    },
  },
  TaskBadge: {
    taskCountChange(entity, { count }) {
      entity.count = count;
    },
  },
};

const store = createStore({ types, entities: { tasks: { type: "Tasks", items: [] } } });
store.notify("Tasks:taskAdd", "Buy milk");
```

`createStore({ types, entities, systems, autoCreateEntities, updateMode: "auto" | "manual", middlewares, devMode })`. Manual mode queues until `store.update()`. `devMode: import.meta.env.DEV` freezes the state, so writing to an entity read through the api throws a clear error. A throwing handler rolls back its whole update.

Store: `notify`, `dispatch`, `getState`, `setState` (bypasses handlers), `update`. Handler `api`: `getEntities`, `getEntity`, `select`, `notify`, `dispatch`, `getTypes`, `getType`, `setType`.

## Events

- Handlers get `(entity, payload, api)` and may mutate `entity` (Mutative).
- Targets: `"event"` (all), `"Type:event"`, `"#id:event"`, `"Type#id:event"`.
- Name handlers as events, not commands: `overlaysClose`, not `closeOverlays`. No `handle` prefix; base-verb tense.
- Broadcasts name the subject (`playerShoot`); scoped events stay bare (`#form1:submit`). Don't scope to rescue a vague name. Engine broadcasts by default, web scopes.
- Never notify a handler's own name (infinite loop).
- Payloads carry the least available: `remove` an id, `add` the entity; nothing derivable from the store.
- Exception: `convertSlice` keeps RTK reducer names.

## Pitfalls

- `api.getEntity`/`getEntities` read the state as the previous event left it: a chain of events sees each change, handlers of the same event don't see each other's. They are read-only.
- Never mutate another entity; notify it.
- `entity` is a draft revoked when the update ends: write only before the first `await`, then notify. Payloads read after an `await` must be copies (`{ ...entity.values }`).

## Built-in events

- `add` (entity; runs `create`), `remove` (id; runs `destroy`). `create`/`destroy` reach only their entity; `add`/`remove` broadcast. Entities added before their type get `create` at `setType`; replacing a type sends none.
- `patch` (merges named fields) and `replace` (whole entity): no `create`/`destroy`; `undefined` clears a field; a new `type` moves handlers.
- `pause`/`resume`: stops `update` events; other events flow. Entities opt out with `updatesWhilePaused: true` (on the entity). Engine's `game()` keeps `paused` on the game entity.
- `stateChange` from `fsm()`.

## Async

```javascript
import { handleAsync, handleRequest } from "@inglorious/store/async";
import { optimistic } from "@inglorious/store/optimistic";

const Todos = {
  create(entity) { entity.status = "idle"; },
  ...handleRequest("fetchTodos", {
    async run(payload, api) { return (await fetch("/api/todos")).json(); },
    success(entity, todos) { entity.todos = todos; },
  }, { toError: (error) => errorKey(error) }),
};
```

- Prefer `handleRequest`: `status` `"loading"` → `"success"`/`"error"`, `error` cleared on start and set to `toError(error)` (default the message), latest call only (an answer from a replaced call is dropped). `error(entity, value)` runs after the field is set and may override it. Options: `status`/`error` field names (several requests per entity), `toError`, `isLatestOnly: false` (every call counts). Debounce with `[Type, withDebounce(300, ["fetchTodos"])]` from web.
- `handleAsync` is the lower level, same events, no status, every answer kept: background saves, failures only logged, checks that keep their last answer. `scope` (both helpers): `"entity"` (default, `#id:event`), `"type"` (`Type:event`), `"global"` (`event`, common in games).
- Generates `fetchTodos`, `fetchTodosStart` (always for `handleRequest`, else only if given), `Run`, `Success`, `Error`, `Finally`. `run` gets `(payload, api)`, not the entity.
- `optimistic(handleRequest(...) or handleAsync(...), patch, { rollback })`: patch (object or function) applied on start, rolled back on error per call. Events carry `callId`.

## Storage

One source of truth: the entity. Storage is only a byproduct, never read by the app.

```javascript
import { withStorage } from "@inglorious/store/storage";
const types = { Settings: [Settings, withStorage(["theme"], { key: "my-app", storage: () => localStorage })] };
```

- Fields come back on `create`, before the type's own `create` (`??=` defaults keep them); written back after any handler that changes them. Last in the array. Key defaults to the entity id. Storage failures keep nothing, silently.
- A storage answering with promises (Capacitor Preferences via `createNativeStorage` from `@inglorious/web/device/storage`): the entity starts with defaults, then `#id:storageRestore` restores the stored fields; nothing written before. A type's own `storageRestore(entity, restored, api)` runs after, to announce it.
- Never `localStorage.getItem` in handlers, guards or renders: read the entity.

## Composition

A type is an object or an array applied left to right: objects are mixins; functions are decorators `(typeSoFar) => additions`. A later handler of the same name replaces the earlier; a decorator calls `type.event?.(entity, payload, api)` to keep it.

Systems: `systems: [{ taskComplete(state, payload) {...} }]` run after entity handlers.

Middlewares: `(store) => store`, usually wrapping `store.dispatch`; the first wraps the rest.

## fsm and scenes

```javascript
import { fsm } from "@inglorious/store/fsm";
import { scenes } from "@inglorious/store/scenes";

const types = {
  Wizard: [
    { knock(entity) { entity.knocks++; } }, // default for every state
    scenes({
      account: () => [{ id: "accountForm", type: "AccountForm" }],
      billing: (wizard) => [{ id: "billingForm", type: "BillingForm", plan: wizard.plan }],
    }),
    fsm({
      account: { next(entity) { entity.state = "billing"; } },
    }),
  ],
};
```

- `fsm` goes after the behaviors it falls back to. State handlers replace type handlers; unanswered events are ignored. Move by assigning `entity.state` (default `"default"`). Broadcasts `stateChange` `{ entityId, from, to }`. TS: declare `state` as a union; outside a typed store, `fsm<E, AppApi>(...)`; payload `StateChangePayload`.
- `scenes` adds/removes/patches entities by `id` on entering each state; current list in `scene`. Use for page-scoped entities, wizard steps, modes.

## Selectors

```javascript
import { compute } from "@inglorious/store/select"; // alias createSelector
const total = compute((count, mult) => count * mult, [(e) => e.counter1.value, (e) => e.settings.multiplier]);
api.select(total);
```

## Testing

```javascript
import { trigger, createMockApi } from "@inglorious/store/test";

const api = createMockApi({ counter1: { type: "Counter", value: 10 } });
const { entity, events } = trigger({ id: "counter2", type: "Counter", value: 20 }, valueCopy, { sourceId: "counter1" }, api);
expect(api.getEvents()).toEqual([{ type: "#counter2:valueIncrement" }]);
```

## TypeScript

```typescript
import type { Api, BaseEntity, EntitiesState } from "@inglorious/store";

interface FormEntity extends BaseEntity {
  type: "Form";
  value: string;
}
type AppEntity = FormEntity;
interface AppState extends EntitiesState<AppEntity> {
  form: FormEntity;
}
type AppEvents = EventsOf<FormType | RouterType>;
type AppApi = Api<AppEntity, AppState, AppEvents>; // from @inglorious/web in web apps

type FormType = {
  inputChange: (entity: FormEntity, value: string) => void;
  submit: (entity: FormEntity, payload: void, api: AppApi) => void;
};

export const Form: FormType = { inputChange(entity, value) { entity.value = value; }, submit(entity, _, api) {} };

const store = createStore<AppEntity, AppState, AppEvents>({ types: { Form }, entities: { form: { type: "Form", value: "" } } });
```

- Declarations live in `types/*.d.ts`. Never cast `types`.
- Type aliases (`type`, not `interface`) by default. `satisfies EntityType<E, AppApi>` (create-app's `AppType<E>`) is the looser shorthand; never annotate with it.
- `handleRequest`/`handleAsync` events in aliases: `& AsyncEvents<"fetch", E, Payload, Result, AppApi>`. Prefer inference to explicit type args.
- `BaseEntity` is only `type`, `id`, `updatesWhilePaused`. Handlers get `id: string`; omit `id` in initial entities.
- Library entities: `interface AppRouterEntity extends RouterEntity { type: "Router" }`, never `Omit`.
- Typed `notify` checks name (after any target) and payload; built-in events always allowed. Libraries export `RouterType`, `ChatType`, `AnalyticsType`, `PushPromptType`.
- Prop-taking sub-renderers: `defineType<ChatEntity, AppApi>()({ ...template, render(props, api) {...} })`; usable in behavior arrays.

## RTK migration

```javascript
import { convertSlice, convertAsyncThunk, createRTKCompatDispatch } from "@inglorious/store/migration/rtk";

const TodoList = convertSlice(todosSlice, {
  asyncThunks: { fetchTodos: { payloadCreator: fetchTodos.payloadCreator, onPending, onFulfilled, onRejected } },
  extraHandlers,
});
const dispatch = createRTKCompatDispatch(api, "todos"); // "todos/addTodo" → "#todos:addTodo"
```

- `convertSlice` keeps `caseReducers` names, wraps them with `{ type, payload }`, generates `create` from `getInitialState()`, detects `create.asyncThunk`.
- `convertAsyncThunk`: `onPending`→`start`, `payloadCreator`→`run`, `onFulfilled`→`success`, `onRejected`→`error`, `onSettled`→`finally`; `scope: "entity" | "type" | "global"`.
- Compat dispatch doesn't support function thunks.
