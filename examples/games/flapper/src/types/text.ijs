import { renderText } from "@inglorious/renderer-2d/text.js"

import { GAME_STATE } from "../constants.js"

const EMPTY = ""

const line = (text) => () => text
const scoreLine = (game) => `Score: ${game.score}`
const promptLine = (game) =>
  game.isMobile ? "Tap to Play" : "Press Enter to Play"
const gameOverPromptLine = (game) =>
  game.isMobile ? "Tap to Play Again!" : "Press Enter to Play Again!"

export const Title = message(line("Inglorious Flapper"), GAME_STATE.title)
export const TitlePrompt = message(promptLine, GAME_STATE.title)
export const Countdown = message(
  (game) => `${game.count}`,
  GAME_STATE.countdown,
)
export const Score = message(scoreLine, GAME_STATE.play)
export const GameOver = message(line("Oof! You lost!"), GAME_STATE.score)
export const GameOverScore = message(scoreLine, GAME_STATE.score)
export const GameOverPrompt = message(gameOverPromptLine, GAME_STATE.score)

function message(value, state) {
  return {
    render: renderText,

    update(entity, dt, api) {
      const game = api.getEntity("game")
      entity.value = game.state === state ? value(game) : EMPTY
    },
  }
}
