import RendererChooser from "../renderer-chooser.jsx"
import bouncingWithBehaviors from "./bouncing-with-behaviors.js"
import bouncingWithSystems from "./bouncing-with-systems.js"

export default {
  title: "Engine/Systems",
  component: RendererChooser,
}

export const BouncingWithBehaviors = {
  name: "Bouncing with Behaviors",
  args: { config: bouncingWithBehaviors },
}

export const BouncingWithSystems = {
  name: "Bouncing with Systems",
  args: { config: bouncingWithSystems },
}
