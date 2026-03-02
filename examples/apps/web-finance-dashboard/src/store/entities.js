import { screenerRows } from "../mocks/screener.js"

export const entities = {
  router: {
    type: "router",
  },

  dashboardPage: {
    type: "dashboardPage",
    selectedMarket: null,
    selectedCurrency: null,
    selectedIsin: null,
    instrument: null,
    quote: { ask: 0, bid: 0, mid: 0 },
    initialized: false,
    loading: false,
    error: null,
    dataSource: "mock",
  },

  screenerPage: {
    type: "screenerPage",
  },

  assetPage: {
    type: "assetPage",
    symbol: "AAPL",
    loaded: false,
    loading: false,
    error: null,
    dataSource: "mock",
    fallbackSymbols: [],
    warning: null,
  },

  notFoundPage: {
    type: "notFoundPage",
  },

  financeQuotationChart: {
    type: "line",
    data: [],
    brush: {
      enabled: true,
      height: 28,
    },
  },

  marketsTable: {
    type: "financeTable",
    ownerId: "dashboardPage",
    selectEvent: "marketSelect",
    rowId: "market",
    isMultiSelect: false,
    columns: [
      { id: "market", title: "Market", isSortable: false, isFilterable: false },
      {
        id: "description",
        title: "Description",
        width: "100%",
        isSortable: false,
        isFilterable: false,
      },
    ],
    data: [],
    pagination: { pageSize: 10 },
  },

  currenciesTable: {
    type: "financeTable",
    ownerId: "dashboardPage",
    selectEvent: "currencySelect",
    rowId: "currency",
    isMultiSelect: false,
    columns: [
      {
        id: "currency",
        title: "Currency",
        isSortable: false,
        isFilterable: false,
      },
      { id: "market", title: "Market", isSortable: false, isFilterable: false },
    ],
    data: [],
    pagination: { pageSize: 10 },
  },

  isinsTable: {
    type: "financeTable",
    ownerId: "dashboardPage",
    selectEvent: "isinSelect",
    rowId: "isin",
    isMultiSelect: false,
    columns: [
      {
        id: "isin",
        title: "ISIN",
        width: 160,
        isSortable: false,
        isFilterable: false,
      },
      {
        id: "code",
        title: "Code",
        width: 230,
        isSortable: false,
        isFilterable: false,
      },
      {
        id: "currency",
        title: "Currency",
        width: 95,
        isSortable: false,
        isFilterable: false,
      },
      {
        id: "priority",
        title: "Priority",
        width: 90,
        isSortable: false,
        isFilterable: false,
      },
    ],
    data: [],
    pagination: { pageSize: 10 },
  },

  isinHistoryTable: {
    type: "financeTable",
    rowId: "rowId",
    isMultiSelect: false,
    columns: [
      { id: "isin", title: "ISIN", isSortable: false, isFilterable: false },
      { id: "t", title: "T", isSortable: false, isFilterable: false },
      {
        id: "mid",
        title: "Mid",
        type: "number",
        isSortable: false,
        isFilterable: false,
      },
    ],
    data: [],
    pagination: { pageSize: 25 },
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
