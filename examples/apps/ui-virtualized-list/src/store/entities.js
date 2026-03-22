const LARGE_NUMBER = 1000
const INDEX_TO_ID = 1
const PRICE_MULTIPLIER = 10

export const entities = {
  list: {
    type: "productList",
    items: Array(LARGE_NUMBER)
      .fill(null)
      .map((_, index) => ({
        id: index + INDEX_TO_ID,
        name: `Item ${index + INDEX_TO_ID}`,
        price: (index + INDEX_TO_ID) * PRICE_MULTIPLIER,
      })),
  },
}
