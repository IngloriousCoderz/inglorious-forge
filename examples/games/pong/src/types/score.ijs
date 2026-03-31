import { renderText } from "@inglorious/renderer-2d/text"

export const Score = {
  render: renderText,

  playerScore(entity, scoringPlayer, api) {
    entity[scoringPlayer]++

    if (entity[scoringPlayer] >= entity.maxScore) {
      api.notify("playerWin", scoringPlayer)
    }
  },

  reset(entity) {
    entity.player1 = 0
    entity.player2 = 0
  },

  update(entity) {
    entity.value = `${entity.player1} - ${entity.player2}`
  },
}
