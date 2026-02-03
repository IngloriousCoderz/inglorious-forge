import RendererChooser from "../../../renderer-chooser.jsx"
import align from "./align.js"
import arrive from "./arrive.js"
import face from "./face.js"
import flee from "./flee.js"
import seek from "./seek.js"
import wander from "./wander.js"
import wanderAsSeek from "./wander-as-seek.js"

export default {
  title: "Engine/AI/Movement/Kinematic",
  component: RendererChooser,
}

export const Seek = {
  args: { config: seek },
}

export const Flee = {
  args: { config: flee },
}

export const Arrive = {
  args: { config: arrive },
}

export const Align = {
  args: { config: align },
}

export const Face = {
  args: { config: face },
}

export const Wander = {
  args: { config: wander },
}

export const WanderAsSeek = {
  args: { config: wanderAsSeek },
}
