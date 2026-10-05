export function game() {
  return {
    // The store halts the world when it sees these, so that anything which moves by
    // integrating a delta time stops without having to be told about it, and a type
    // that declares `updatesWhilePaused` is exempt so an overlay keeps working.
    //
    // Setting the flag here as well is what makes `paused` readable, for the things
    // that want to know rather than to be halted.
    pause(entity) {
      entity.paused = true
    },

    resume(entity) {
      entity.paused = false
    },

    keyboardKeyUp(entity, code) {
      switch (code) {
        case "KeyC":
          entity.debug = !entity.debug
          break

        case "KeyD":
          entity.devMode = !entity.devMode
          break
      }
    },
  }
}
