/**
 * The app's own tools, which answers call with Query and Mutation: a small
 * expense book kept in memory, standing in for a real backend.
 */

const expenses = [
  { date: "2026-10-02", category: "Rent", amount: 900, note: "October rent" },
  { date: "2026-10-04", category: "Food", amount: 64, note: "Groceries" },
  { date: "2026-10-09", category: "Transport", amount: 40, note: "Train pass" },
  { date: "2026-10-12", category: "Food", amount: 38, note: "Dinner out" },
  { date: "2026-10-15", category: "Fun", amount: 25, note: "Cinema" },
  { date: "2026-10-21", category: "Food", amount: 71, note: "Groceries" },
  { date: "2026-10-23", category: "Transport", amount: 18, note: "Taxi" },
]

const LATENCY_MS = 150
const NOTHING_SPENT = 0
const later = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))

export const toolProvider = {
  /** Every expense, or those of one category. */
  list_expenses: ({ category } = {}) =>
    later({
      rows: expenses.filter(
        (expense) => !category || expense.category === category,
      ),
    }),

  /** The total spent per category, as two lists for a chart. */
  expenses_by_category: () => {
    const totals = new Map()
    for (const { category, amount } of expenses) {
      totals.set(category, (totals.get(category) ?? NOTHING_SPENT) + amount)
    }
    return later({
      categories: [...totals.keys()],
      totals: [...totals.values()],
    })
  },

  /** Adds an expense, dated today. */
  add_expense: ({ category, amount, note }) => {
    const [today] = new Date().toISOString().split("T")
    const expense = {
      date: today,
      category,
      amount: Number(amount),
      note: note ?? "",
    }
    expenses.push(expense)
    return later({ added: expense })
  },
}

const expenseRow = {
  type: "object",
  properties: {
    date: { type: "string" },
    category: { type: "string" },
    amount: { type: "number" },
    note: { type: "string" },
  },
}

/** What the model is told about the tools, so it knows what to ask for. */
export const toolSpecs = [
  {
    name: "list_expenses",
    description:
      "The user's expenses this month, optionally only one category (Rent, Food, Transport, Fun)",
    inputSchema: {
      type: "object",
      properties: { category: { type: "string" } },
    },
    outputSchema: {
      type: "object",
      properties: { rows: { type: "array", items: expenseRow } },
    },
  },
  {
    name: "expenses_by_category",
    description: "The total spent per category this month",
    inputSchema: { type: "object", properties: {} },
    outputSchema: {
      type: "object",
      properties: {
        categories: { type: "array", items: { type: "string" } },
        totals: { type: "array", items: { type: "number" } },
      },
    },
  },
  {
    name: "add_expense",
    description: "Records a new expense for today",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string" },
        amount: { type: "number" },
        note: { type: "string" },
      },
      required: ["category", "amount"],
    },
    outputSchema: { type: "object", properties: { added: expenseRow } },
  },
]
