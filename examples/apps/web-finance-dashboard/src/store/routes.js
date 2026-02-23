import { setRoutes } from "@inglorious/web/router"

setRoutes({
  "/": "dashboardPage",
  "/screener": "screenerPage",
  "/asset/:symbol": "assetPage",
  "*": "notFoundPage",
})
