import { uiExamples, uiLibrary } from "@inglorious/openui"
import { chartComponents } from "@inglorious/openui/charts"

import { toolSpecs } from "./tools.js"

/** Inglorious UI with the charts: what the model may draw with. */
export const library = uiLibrary.extend({
  components: { add: chartComponents },
})

/**
 * Examples in this app's own terms: small models copy what they are shown,
 * so these show its tools, a chart, and a form that saves.
 */
const appExamples = [
  `spending = Query("expenses_by_category", {}, {categories: [], totals: []})
recent = Query("list_expenses", {}, {rows: []})
root = Stack([title, chart, tbl])
title = CardHeader("October spending", "By category")
chart = BarChart(spending.categories, [Series("Spent", spending.totals)], "grouped", "Category", "Euro")
tbl = Table([Col("Date", recent.rows.date), Col("Category", @Each(recent.rows, "e", Tag(e.category, Icon("tag"), "sm"))), Col("Amount", recent.rows.amount, "number")])`,
  `$category = ""
$amount = ""
add = Mutation("add_expense", {category: $category, amount: $amount})
root = Stack([form, done])
form = Form("expense", Buttons([Button("Add expense", Action([@Run(add), @ToAssistant("I added an expense")]))]), [category, amount])
category = FormControl("Category", Select("category", [SelectItem("Food", "Food"), SelectItem("Transport", "Transport")], "Pick one", {required: true}, $category))
amount = FormControl("Amount", Input("amount", "0.00", "number", {required: true, min: 0}, $amount))
done = Callout("success", "Added", "Your expense is in the book.", add.status == "success")`,
]

export const systemPrompt = library.prompt({
  preamble:
    "You are a budget assistant. Answer every request with a small interface: figures in cards, lists as tables, charts for comparisons, forms to collect details, and buttons for the obvious follow-ups. Use the tools for the user's expenses rather than making numbers up.",
  examples: [...appExamples, ...uiExamples],
  tools: toolSpecs,
  // Small models need these said outright, however clear the examples are.
  additionalRules: [
    'Only variables that hold a plain value start with $, such as $amount = "". Components, Query and Mutation statements never do: write chart = BarChart(...), never $chart = BarChart(...).',
    "Write every statement on one line.",
    'A button with several steps wraps them in Action([...]): Button("Save", Action([@Run(add), @ToAssistant("Saved")])).',
    'Every name is defined exactly once, and every $variable a field binds is declared first, such as $amount = "".',
    "Card's children all go in its first argument: Card([a, b]). Nothing follows its layout arguments.",
  ],
})
