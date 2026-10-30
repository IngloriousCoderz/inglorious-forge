import { chatExamples, chatLibrary, chatRules } from "@inglorious/openui"
import { chartComponents } from "@inglorious/openui/charts"

import { toolSpecs } from "./tools.js"

/** OpenUI's chat library with the charts: what the model may draw with. */
export const library = chatLibrary.extend({
  components: { add: chartComponents },
})

/**
 * Examples in this app's own terms: small models copy what they are shown,
 * so these show its tools, a chart, and a form that saves.
 */
const appExamples = [
  `spending = Query("expenses_by_category", {}, {categories: [], totals: []})
recent = Query("list_expenses", {}, {rows: []})
root = Card([title, chart, tbl, next])
title = CardHeader("October spending", "By category")
chart = BarChart(spending.categories, [Series("Spent", spending.totals)], "grouped", "Category", "Euro")
tbl = Table([Col("Date", recent.rows.date), Col("Category", @Each(recent.rows, "e", Tag(e.category, Icon("tag"), "sm"))), Col("Amount", recent.rows.amount, "number")])
next = FollowUpBlock([FollowUpItem("Where can I save?"), FollowUpItem("Add an expense")])`,
  `$category = ""
$amount = ""
add = Mutation("add_expense", {category: $category, amount: $amount})
root = Card([title, form, done])
title = CardHeader("New expense")
form = Form("expense", Buttons([Button("Add expense", Action([@Run(add), @ToAssistant("I added an expense")]))]), [category, amount])
category = FormControl("Category", Select("category", [SelectItem("Food", "Food"), SelectItem("Transport", "Transport")], "Pick one", {required: true}, $category))
amount = FormControl("Amount", Input("amount", "0.00", "number", {required: true, min: 0}, $amount))
done = Callout("success", "Added", "Your expense is in the book.", add.status == "success")`,
]

export const systemPrompt = library.prompt({
  preamble:
    "You are a budget assistant. Answer every request with a small interface: figures in cards, lists as tables, charts for comparisons, forms to collect details, and buttons for the obvious follow-ups. Use the tools for the user's expenses rather than making numbers up.",
  examples: [...appExamples, ...chatExamples],
  tools: toolSpecs,
  additionalRules: [
    ...chatRules,
    'Only variables that hold a plain value start with $, such as $amount = "". Components, Query and Mutation statements never do: write chart = BarChart(...), never $chart = BarChart(...).',
    "Write every statement on one line.",
    'A button with several steps wraps them in Action([...]): Button("Save", Action([@Run(add), @ToAssistant("Saved")])).',
    'Every name is defined exactly once, and every $variable a field binds is declared first, such as $amount = "".',
    "Card's children all go in its first argument: Card([a, b]), its sources, if any, in its second.",
    "The tools' data is the user's own, not a source: give the Card sources only for web pages you were given.",
  ],
})
