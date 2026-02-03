import RendererChooser from "../renderer-chooser.jsx"
import bounds from "./bounds.js"
import codeReuse from "./code-reuse.js"
import entities from "./entities.js"
import eventHandlers from "./event-handlers.js"
import framerate from "./framerate.js"

export default {
  title: "Engine/Core Concepts",
  component: RendererChooser,
}

export const Bounds = {
  args: { config: bounds },
}

export const Entities = {
  args: { config: entities },
}

export const EventHandlers = {
  args: { config: eventHandlers },
}

export const CodeReuse = {
  args: { config: codeReuse },
}

export const Framerate = {
  args: { config: framerate },
}
