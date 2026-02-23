import { screenerRows } from "../mocks/screener.js"

export const entities = {
  router: {
    type: "router",
  },

  dashboardPage: {
    type: "dashboardPage",
  },

  screenerPage: {
    type: "screenerPage",
  },

  assetPage: {
    type: "assetPage",
    symbol: "AAPL",
  },

  notFoundPage: {
    type: "notFoundPage",
  },

  screenerTable: {
    type: "financeTable",
    columns: [
      { id: "symbol", title: "Symbol", isSortable: true, isFilterable: true },
      {
        id: "name",
        title: "Name",
        width: "100%",
        isSortable: true,
        isFilterable: true,
      },
      {
        id: "price",
        title: "Price",
        type: "number",
        isSortable: true,
        isFilterable: true,
      },
      {
        id: "changePct",
        title: "%",
        type: "number",
        isSortable: true,
        isFilterable: true,
      },
      {
        id: "volume",
        title: "Volume",
        type: "number",
        isSortable: true,
        isFilterable: true,
      },
      {
        id: "marketCap",
        title: "Market Cap",
        type: "number",
        isSortable: true,
        isFilterable: true,
      },
    ],
    rowId: "symbol",
    data: screenerRows,
    search: {},
    pagination: { pageSize: 10 },
  },
}
