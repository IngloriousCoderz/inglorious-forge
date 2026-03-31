const LARGE_NUMBER = 30
const INDEX_TO_ID = 1
const PRICE_MULTIPLIER = 10
const COIN_FLIP = 0.5
const TIME_MULTIPLIER = 3600_000

export const entities = {
  dataGrid: {
    type: "ProductTable",
    columns: [
      {
        id: "id",
        type: "number",
        isSortable: true,
        isFilterable: true,
        filter: { type: "number" },
      },
      {
        id: "name",
        width: "100%",
        isSortable: true,
        isFilterable: true,
      },
      {
        id: "price",
        type: "number",
        isSortable: true,
        isFilterable: true,
      },
      {
        id: "isAvailable",
        title: "Is Available",
        type: "boolean",
        width: 120,
        isSortable: true,
        isFilterable: true,
        formatter: "isAvailable",
      },
      {
        id: "createdAt",
        type: "date",
        width: 420,
        isSortable: true,
        isFilterable: true,
        filter: { type: "datetime" },
        formatter: "createdAt",
      },
    ],
    rows: Array(LARGE_NUMBER)
      .fill(null)
      .map((_, index) => ({
        id: index + INDEX_TO_ID,
        name: `Item ${index + INDEX_TO_ID}`,
        price: (index + INDEX_TO_ID) * PRICE_MULTIPLIER,
        isAvailable: Math.random() > COIN_FLIP,
        createdAt: new Date().getTime() + index * TIME_MULTIPLIER,
      })),
    search: {},
    pagination: {
      pageSize: 10,
    },
    isMultiSelect: true,
  },
}
