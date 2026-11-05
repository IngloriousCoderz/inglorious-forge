// The events a store answers, so that `notify` can check them: the event's
// name, wherever it is sent, and its payload.

import type { BaseEntity, Stored } from "./store"

declare const anyEvents: unique symbol

/**
 * The events of an api or a store that has not been told its events: any
 * name, any payload. It is the default, so an untyped app type-checks as
 * before.
 */
export type AnyEvents = { readonly [anyEvents]: true }

/**
 * The events a store's types answer, by name, with their payloads, read from
 * the types' own declarations: the second parameter of each handler is its
 * payload, and a handler that takes none has no payload. `render` and the
 * other `render…` members are renderers, not events, so they are left out.
 *
 * ```ts
 * type CounterType = {
 *   add: (entity: CounterEntity, amount: number) => void
 *   reset: (entity: CounterEntity) => void
 * }
 *
 * type AppEvents = EventsOf<CounterType | LabelType>
 * // { add: number; reset: void; ...the label's events }
 *
 * type AppApi = Api<AppEntity, AppState, AppEvents>
 * ```
 *
 * An event two types answer takes either type's payload.
 */
export type EventsOf<TTypes> = {
  [TEvent in HandlerName<TTypes>]: TTypes extends unknown
    ? TEvent extends keyof TTypes
      ? PayloadOf<TTypes[TEvent]>
      : never
    : never
}

/**
 * The events the store answers itself, whatever its types: an entity
 * arriving, leaving or changing, and the world pausing and resuming.
 */
export type BuiltInEvents<TEntity extends BaseEntity = BaseEntity> = {
  add: TEntity & { id: string }
  remove: string
  patch: Partial<TEntity> & { id: string }
  replace: Stored<TEntity>
  pause: void
  resume: void
  update: number | undefined
}

/**
 * How an event is sent: by its name alone, broadcast to whoever answers it,
 * or after a target that narrows it down to a type (`Type:event`), an entity
 * (`#id:event`) or both (`Type#id:event`). Only the event's name is checked:
 * the target is usually built at runtime, such as `` `#${entity.id}:submit` ``.
 */
export type EventType<TEvents> =
  EventName<TEvents> | `${string}:${EventName<TEvents>}`

/**
 * Sends an event. Told the store's events, it checks the event's name and
 * its payload: `notify("#debate:lineAdd", line)` must name an event the
 * store's types answer, and `line` must be that event's payload. An event
 * with no payload takes none. Otherwise any name and payload go.
 */
export type Notify<
  TEvents = AnyEvents,
  TEntity extends BaseEntity = BaseEntity,
> = AnyEvents extends TEvents
  ? (type: string, payload?: any) => void
  : TypedNotify<WithBuiltIns<TEvents, BuiltInEvents<TEntity>>>

type EventName<TEvents> = keyof TEvents & string

/**
 * The app's events and the store's own, by name. An app event named like a
 * built-in one, such as an `add` that takes an amount, takes either payload,
 * because its handlers hear both: the store broadcasts entities as `add` too.
 */
type WithBuiltIns<TEvents, TBuiltIns> = {
  [K in keyof TEvents | keyof TBuiltIns]:
    | (K extends keyof TEvents ? TEvents[K] : never)
    | (K extends keyof TBuiltIns ? TBuiltIns[K] : never)
}

/** The event a sent type names: what follows its target, if it has one. */
type EventOf<TType extends string> = TType extends `${string}:${infer TEvent}`
  ? TEvent
  : TType

/** The payload as `notify`'s last parameters: none, optional or required. */
type PayloadArgs<TPayload> = [TPayload] extends [void]
  ? [payload?: undefined]
  : undefined extends TPayload
    ? [payload?: TPayload]
    : [payload: TPayload]

/**
 * A typed `notify`, declared as a method and taken out by name, with an
 * overload that nothing can call: it only lets a typed api or store fit
 * where a plain one is expected, such as a component that takes any app's
 * api. It comes first, so that a call that fits neither is explained by the
 * typed one.
 */
type TypedNotify<TEvents> = {
  notify(type: never, payload: never): void
  notify<TType extends EventType<TEvents>>(
    type: TType,
    ...payload: PayloadArgs<TEvents[EventOf<TType> & keyof TEvents]>
  ): void
}["notify"]

/**
 * The handlers' names of each type: every function but the renderers. Only
 * named members count: a type that also takes any handler, through an index
 * signature such as `[handler: string]: unknown`, keeps its named events.
 */
type HandlerName<TTypes> = TTypes extends unknown
  ? keyof {
      [
        K in keyof TTypes as string extends K
          ? never
          : number extends K
            ? never
            : K extends `render${string}`
              ? never
              : TTypes[K] extends (...args: never[]) => unknown
                ? K
                : never
      ]: true
    } &
      string
  : never

/** A handler's payload: its second parameter, or none if it takes only the entity. */
type PayloadOf<THandler> = THandler extends (
  entity: never,
  ...rest: infer TRest
) => unknown
  ? TRest extends []
    ? void
    : TRest[0]
  : never
