import { DataGrid } from "@inglorious/ui/data-grid"
import { format } from "date-fns"

const formatters = {
  isAvailable: (value) => (value ? "✅" : "❌"),
  createdAt: (value) => format(value, "dd/MM/yyyy HH:mm"),
}

export const ProductTable = {
  ...DataGrid,

  renderValue(_, { value, column }) {
    return formatters[column.formatter]?.(value) ?? value
  },
}
