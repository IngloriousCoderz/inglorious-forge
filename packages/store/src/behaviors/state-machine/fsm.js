const DEFAULT_STATE = "default"

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

            const handler = states[entity.state]?.[eventName] ?? type[eventName]

            handler?.(entity, event, api)

            announce(entity, from, api)
          },
        }),
        {},
      ),
    }
  }
}

/** Broadcasts `stateChange` when the handler actually moved the entity. */
function announce(entity, from, api) {
  const to = entity.state

  if (to === from) return

  api.notify("stateChange", { entityId: entity.id, from, to })
}
