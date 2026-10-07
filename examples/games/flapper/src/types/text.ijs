import { renderText } from "@inglorious/renderer-2d/text.js"

const EMPTY = ""

const line = (text) => () => text
const scoreLine = (game) => `Score: ${game.score}`
const promptLine = (game) =>
  game.isMobile ? "Tap to Play" : "Press Enter to Play"
const gameOverPromptLine = (game) =>
  game.isMobile ? "Tap to Play Again!" : "Press Enter to Play Again!"

export const Title = message(line("Inglorious Flapper"), "title")
export const TitlePrompt = message(promptLine, "title")
export const Countdown = message((game) => `${game.count}`, "countdown")
export const Score = message(scoreLine, "play")
export const GameOver = message(line("Oof! You lost!"), "score")
export const GameOverScore = message(scoreLine, "score")
export const GameOverPrompt = message(gameOverPromptLine, "score")

function message(value, state) {
  return {
    render: renderText,

    update(entity, dt, api) {
      const game = api.getEntity("game")
      entity.value = game.state === state ? value(game) : EMPTY
    },
  }
}
