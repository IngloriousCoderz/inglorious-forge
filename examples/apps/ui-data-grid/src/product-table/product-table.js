import "@inglorious/ui/tokens"
import "@inglorious/ui/themes/inglorious"
import "@inglorious/ui/data-grid.css"

import { dataGrid } from "@inglorious/ui/data-grid"
import { format } from "date-fns"

const formatters = {
  isAvailable: (value) => (value ? "✅" : "❌"),
  createdAt: (value) => format(value, "dd/MM/yyyy HH:mm"),
}

export const productTable = {
  ...dataGrid,

  renderValue(_, { value, column }) {
    return formatters[column.formatter]?.(value) ?? value
  },
}
