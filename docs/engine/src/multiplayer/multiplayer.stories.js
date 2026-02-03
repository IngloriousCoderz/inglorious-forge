import RendererChooser from "../renderer-chooser.jsx"
import player1 from "./player1.js"
import player2 from "./player2.js"

export default {
  title: "Engine/Multiplayer",
  component: RendererChooser,
}

export const Player1 = {
  args: { config: player1 },
}

export const Player2 = {
  args: { config: player2 },
}
