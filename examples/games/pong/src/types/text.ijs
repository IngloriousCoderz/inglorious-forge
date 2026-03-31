import { renderText } from "@inglorious/renderer-2d/text"

const PlayerName = {
  player1: "Player 1",
  player2: "Player 2",
}

export const Text = {
  render: renderText,

  start(entity, _, api) {
    const { isMobile } = api.getEntity("game")
    const actionText = isMobile ? "Tap the ball" : "Press Spacebar"
    entity.value = `Welcome to Pong!\n${actionText} to begin!`
  },

  serve(entity, servingPlayer, api) {
    const { isMobile } = api.getEntity("game")
    const actionText = isMobile ? "Tap the ball" : "Press Spacebar"
    entity.value = `${PlayerName[servingPlayer]}'s serve!\n${actionText} to serve!`
  },

  play(entity) {
    entity.value = ""
  },

  playerWin(entity, winningPlayer, api) {
    const { isMobile } = api.getEntity("game")
    const actionText = isMobile ? "Tap the ball" : "Press Spacebar"
    entity.value = `${PlayerName[winningPlayer]} wins!\n${actionText} to restart!`
  },
}
