import { createDevtools } from "@inglorious/store/client/devtools"
import { withTransitions } from "@inglorious/ui/view-transitions"

export const middlewares = [withTransitions()]

if (import.meta.env.DEV) {
  middlewares.push(createDevtools().middleware)
}
