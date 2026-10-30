import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Dynamically loads the initial game state from a module and provides a fallback.
 * @param {string} gameFilePath The path to the game module.
 * @param {object} logger A Pino logger instance.
 * @returns {Promise<{initialTypes: object, initialEntities: object}>} The initial game state.
 */
export async function loadGame(gameFilePath, logger) {
  let gameConfig = {}

  try {
    if (!gameFilePath) {
      return gameConfig
    }

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const modulePath = path.resolve(__dirname, gameFilePath)
    const module = await import(`file://${modulePath}`)

    logger.info(`Loaded game data from ${gameFilePath}`)
    gameConfig = module.default
    return gameConfig
  } catch (error) {
    logger.error(`Failed to load game module: ${gameFilePath}`)
    logger.error(error)

    logger.warn("Using default game state as a fallback.")
    gameConfig = {}
    return gameConfig
  } finally {
    gameConfig.types ??= {}
    gameConfig.entities ??= {}
  }
}
