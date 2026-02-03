import RendererChooser from "../../renderer-chooser.jsx"
import decisionTree from "./decision-tree.js"
import states from "./states.js"

export default {
  title: "Engine/AI/Decision Making",
  component: RendererChooser,
}

export const States = {
  args: { config: states },
}

export const DecisionTree = {
  args: { config: decisionTree },
}
