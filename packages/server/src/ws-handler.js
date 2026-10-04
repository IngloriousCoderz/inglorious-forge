import { serialize } from "@inglorious/utils/objects"
import { WebSocketServer } from "ws"

/**
 * Initializes the WebSocket server and sets up event handlers.
 * @param {object} httpServer The HTTP server instance to attach to.
 * @param {object} store The game store instance.
 * @param {object} logger A Pino logger instance.
 * @returns {void}
 */
export function setup(httpServer, store, logger) {
  const wss = new WebSocketServer({ server: httpServer })

  wss.on("connection", (ws) => {
    logger.info("A new client has connected.")

    ws.send(serialize({ type: "stateInit", payload: store.getState() }))

    ws.on("message", (rawData) => {
      try {
        const eventString = rawData.toString()
        const event = JSON.parse(eventString)
        store.dispatch(event)

        for (const client of wss.clients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(eventString)
          }
        }
      } catch (error) {
        logger.error({ error }, "Failed to parse message.")
      }
    })

    ws.on("close", (code, reason) => {
      logger.info(`Client disconnected. Code: ${code}, Reason: ${reason}`)
    })

    ws.on("error", (error) => {
      logger.error({ error }, "WebSocket error occurred.")
    })
  })
}
