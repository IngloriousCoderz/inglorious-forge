const DEFAULT_STATE = "default"

// The transition a machine announces when it moves, so that anything which depends on
// which state a thing is in does not have to be wired to every transition by hand.
export const STATE_CHANGE = "stateChange"

export function fsm(states) {
  const uniqueEventNames = [
    ...new Set(Object.values(states).flatMap(Object.keys)),
  ]

  return (type) => {
    return {
      create(entity, payload, api) {
        type.create?.(entity, payload, api)

        entity.state ??= DEFAULT_STATE
      },

      ...uniqueEventNames.reduce(
        (acc, eventName) => ({
          ...acc,

          [eventName](entity, event, api) {
            const from = entity.state

            type[eventName]?.(entity, event, api)

            const state = states[entity.state]
            state?.[eventName]?.(entity, event, api)

            announce(entity, from, api)
          },
        }),
        {},
      ),
    }
  }
}

/**
 * A machine announces where it has landed, but only when it has actually moved: a
 * handler that reads the state without changing it should not wake anything up.
 *
 * The announcement is broadcast and carries the id, rather than being addressed to
 * this entity, because what wants to hear it is usually something else.
 */
function announce(entity, from, api) {
  const to = entity.state

  if (to === from) return

  api.notify(STATE_CHANGE, { entityId: entity.id, from, to })
}
