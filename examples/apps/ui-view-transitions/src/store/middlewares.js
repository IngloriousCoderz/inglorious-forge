import { createDevtools } from "@inglorious/store/client/devtools"
import { withTransitions } from "@inglorious/ui/view-transitions"

/* withTransitions is what turns the render that follows a navigation into a
   view transition, tagged with the direction it navigated in. Drop it and the
   app navigates instantly; nothing else in the wiring changes. */
export const middlewares = [withTransitions()]

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
