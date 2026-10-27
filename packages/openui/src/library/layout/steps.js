import { Stepper } from "@inglorious/ui/stepper"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** No step is current: Steps is a guide, not a progress tracker. */
const NO_ACTIVE_STEP = -1

export const StepsItem = defineComponent({
  name: "StepsItem",
  description: "One step: its title and details",
  props: z.object({ title: z.string(), details: z.string().optional() }),
  component: () => null,
})

export const Steps = defineComponent({
  name: "Steps",
  description: "A step-by-step guide, in order",
  props: z.object({ items: z.array(StepsItem.ref) }),
  component: ({ props }) =>
    Stepper.render({
      orientation: "vertical",
      activeStep: NO_ACTIVE_STEP,
      steps: (props.items ?? []).filter(Boolean).map((item) => ({
        label: item.props.title,
        optional: item.props.details,
      })),
    }),
})
