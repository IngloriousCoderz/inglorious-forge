export const screenerRows = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 187.42,
    changePct: 1.24,
    volume: 52200123,
    marketCap: 2920000000000,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 421.15,
    changePct: 0.67,
    volume: 23811203,
    marketCap: 3130000000000,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 902.33,
    changePct: 2.87,
    volume: 40200231,
    marketCap: 2240000000000,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 179.08,
    changePct: -0.34,
    volume: 31152010,
    marketCap: 1860000000000,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 163.55,
    changePct: 0.42,
    volume: 20458890,
    marketCap: 2010000000000,
  },
]

export const screenerBySymbol = Object.fromEntries(
  screenerRows.map((row) => [row.symbol, row]),
)
