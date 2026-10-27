import { html } from "@inglorious/web"
import { z } from "zod"

import { chartComponents } from "../types/charts.js"
import {
  createLibrary,
  createOpenUI,
  defineComponent,
  type OpenUIActionEvent,
  uiLibrary,
} from "../types/index.js"

const Greeting = defineComponent({
  name: "Greeting",
  description: "Greets someone",
  props: z.object({ name: z.string() }),
  component: ({ props }) => html`<p>Hello, ${props.name}</p>`,
})

const library = createLibrary({ components: [Greeting], root: "Greeting" })

export const OpenUI = createOpenUI({ library })
export const Ui = createOpenUI({ library: uiLibrary })

export const WithTools = createOpenUI({
  library: uiLibrary,
  toolProvider: {
    list_orders: async ({ status }) =>
      fetch(`/api/orders?status=${String(status)}`),
  },
})

createOpenUI({
  library: uiLibrary,
  // @ts-expect-error a tool must return a promise
  toolProvider: { list_orders: () => 42 },
})

export const prompt: string = uiLibrary.prompt({
  preamble: "You build dashboards.",
})

export function handle(event: OpenUIActionEvent): string {
  return `${event.id}: ${event.humanFriendlyMessage}`
}

// @ts-expect-error a library is required
createOpenUI({})

defineComponent({
  name: "Typed",
  description: "Reads only the props it declares",
  props: z.object({ count: z.number() }),
  // @ts-expect-error `label` is not one of its props
  component: ({ props }) => html`${props.label}`,
})

export const WithCharts = createOpenUI({
  library: uiLibrary.extend({ components: { add: chartComponents } }),
})
