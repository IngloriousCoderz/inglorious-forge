import RendererChooser from "../../renderer-chooser.jsx"
import doubleJump from "./double-jump.js"
import jump from "./jump.js"
import modernControls from "./modern-controls.js"
import shooterControls from "./shooter-controls.js"
import tankControls from "./tank-controls.js"

export default {
  title: "Engine/Player/Kinematic",
  component: RendererChooser,
}

export const ModernControls = {
  args: { config: modernControls },
}

export const TankControls = {
  args: { config: tankControls },
}

export const ShooterControls = {
  args: { config: shooterControls },
}

export const Jump = {
  args: { config: jump },
}

export const DoubleJump = {
  args: { config: doubleJump },
}
