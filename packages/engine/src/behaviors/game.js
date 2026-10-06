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

    // Nothing halts on this one, because the loop is not the store's to halt. The flag
    // is set here and the engine reads it after the frame, in the same place it reads
    // `devMode` -- which is what lets any game offer a way out without reaching for the
    // engine itself, and keeps a behaviour testable against a bare store.
    quit(entity) {
      entity.quit = true
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
