import { createRender } from "../../stories/notifyStory.js"
import { stepper } from "."

export default {
  title: "Navigation/Stepper",
  tags: ["autodocs"],
  render: createRender(stepper),
  argTypes: {
    steps: { control: "object", description: "Ordered step definitions." },
    activeStep: {
      control: "number",
      description: "Zero-based active step index.",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Stepper axis.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Progress navigation for multi-step workflows with overridable `renderStep`.",
      },
    },
  },
}

export const Default = {
  args: {
    activeStep: 1,
    steps: [{ label: "Campaign" }, { label: "Ad group" }, { label: "Ad" }],
  },
}
