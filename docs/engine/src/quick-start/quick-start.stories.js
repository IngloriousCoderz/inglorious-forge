import RendererChooser from "../renderer-chooser.jsx"
import firstGame from "./first-game.js"
import helloWorld from "./hello-world.js"

export default {
  title: "Quick Start",
  component: RendererChooser,
}

export const HelloWorld = {
  args: { config: helloWorld },
}

export const FirstGame = {
  args: { config: firstGame },
}
