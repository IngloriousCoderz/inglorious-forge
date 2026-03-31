export const Game = {
  action(entity, _, api) {
    // NOTE: we could use the fsm behavior here, but let's keep it for some more complex game.
    switch (entity.state) {
      case "start":
        entity.state = "serve"
        entity.servingPlayer = "player1"
        api.notify("serve", entity.servingPlayer)
        break

      case "serve":
        entity.state = "play"
        api.notify("play")
        break

      case "gameOver":
        entity.state = "serve"
        api.notify("reset")
        api.notify("serve", entity.servingPlayer)
        break
    }
  },

  playerScore(entity, scoringPlayer, api) {
    entity.state = "serve"
    entity.servingPlayer = scoringPlayer === "player1" ? "player2" : "player1"
    api.notify("serve", entity.servingPlayer)
  },

  playerWin(entity, winningPlayer) {
    entity.state = "gameOver"
    entity.servingPlayer = winningPlayer === "player1" ? "player2" : "player1"
  },
}
