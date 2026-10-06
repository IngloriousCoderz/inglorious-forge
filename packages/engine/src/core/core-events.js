export const coreEvents = [
  "create",
  "update",
  "destroy",
  "gamepadAxis",
  "gamepadPress",
  "gamepadRelease",
  "keyboardKeyDown",
  "keyboardKeyUp",
  "inputAxis",
  "inputPress",
  "inputRelease",
  "mouseMove",
  "mouseClick",
  // Ending the game is the one player's own business: a `quit` reaching another client
  // would stop a game they are still playing.
  "quit",
  "touchStart",
  "touchMove",
  "touchEnd",
  "spriteAnimationEnd",
]
