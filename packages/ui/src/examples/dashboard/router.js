import { setRoutes } from "@inglorious/web/router"
export { Router } from "@inglorious/web/router"

setRoutes({
  "/": "dashboard",
  "/layout/:name": "primitiveSection",
  "/controls/:name": "primitiveSection",
  "/data-display/:name": "primitiveSection",
  "/feedback/:name": "primitiveSection",
  "/navigation/:name": "primitiveSection",
  "/surfaces/:name": "primitiveSection",
  "*": "dashboard",
})
