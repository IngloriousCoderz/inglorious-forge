import {
  createEntityRender,
  notifyActionArgType,
} from "../../stories/notify-story.js"
import { DataGrid } from "."

const baseRows = [
  { id: 1, name: "Charlie", age: 35, active: true, role: "Admin" },
  { id: 2, name: "Alice", age: 30, active: true, role: "User" },
  { id: 3, name: "Bob", age: 25, active: false, role: "User" },
  { id: 4, name: "David", age: 40, active: true, role: "Admin" },
]

const baseColumns = [
  {
    id: "id",
    title: "Id",
    type: "number",
    isSortable: true,
    isFilterable: true,
    filter: { type: "number" },
  },
  { id: "name", title: "Name", isSortable: true, isFilterable: true },
  {
    id: "age",
    title: "Age",
    type: "number",
    isSortable: true,
    isFilterable: true,
  },
  {
    id: "active",
    title: "Active",
    type: "boolean",
    isFilterable: true,
    width: 100,
  },
  {
    id: "role",
    title: "Role",
    isFilterable: true,
    filter: { type: "select", options: ["", "Admin", "User"] },
    width: 100,
  },
]

export default {
  title: "Data Display/DataGrid",
  tags: ["autodocs"],
  render: createEntityRender({ DataGrid }),
  argTypes: {
    ...notifyActionArgType,
    id: { control: "text", description: "Optional grid id" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Data grid primitive with overridable `renderHeaderCell`, `renderRow`, and `renderCell` sub-renders.",
      },
    },
  },
}

export const Default = {
  args: {
    id: "dataGrid",
    type: "DataGrid",
    rows: baseRows,
    columns: baseColumns,
    search: {},
    selection: [2],
    isStriped: true,
  },
}

/** Editable columns: change cells, then reset or save the edits in the footer. */
export const Editable = {
  args: {
    ...Default.args,
    id: "dataGridEditable",
    search: null,
    selection: [],
    columns: [
      { id: "name", title: "Name", isSortable: true, isEditable: true },
      { id: "age", title: "Age", type: "number", isEditable: true },
      {
        id: "active",
        title: "Active",
        type: "boolean",
        width: 100,
        isEditable: true,
      },
      {
        id: "role",
        title: "Role",
        width: 140,
        isEditable: true,
        options: [
          { value: "Admin", label: "Admin" },
          { value: "User", label: "User" },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Columns with `isEditable` put an editor in each cell, by type, or a drop-down with `options`. Edits stay apart from the rows, counted in the footer, until saved.",
      },
    },
  },
}

export const Paginated = {
  args: {
    ...Default.args,
    rows: createRows(48),
    selection: [],
    pagination: {
      page: 0,
      pageSize: 10,
      pageSizes: [10, 20, 50],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the grid with enough rows to exercise pagination, footer controls, and the global search toolbar.",
      },
    },
  },
}

export const FlexibleWidths = {
  args: {
    ...Default.args,
    columns: [
      { ...baseColumns[0], width: "auto" },
      { ...baseColumns[1], width: "2fr" },
      { ...baseColumns[2], width: "1fr" },
      { ...baseColumns[3], width: 100 },
      { ...baseColumns[4], width: "40%" },
    ],
    selection: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates mixed column sizing with `auto`, fractional `fr`, percentage, and fixed widths before any manual resizing.",
      },
    },
  },
}

export const Virtualized = {
  args: {
    id: "virtualizedGrid",
    type: "DataGrid",
    rows: createRows(1000),
    columns: baseColumns,
    search: null,
    selection: [],
    pagination: null,
    isStriped: true,
    isVirtualized: true,
    virtualization: {
      viewportHeight: 480,
      estimatedHeight: 44,
      bufferSize: 6,
      visibleRange: { start: 0, end: 20 },
      itemHeight: null,
      scrollTop: 0,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders 1000 rows with virtualization enabled and pagination disabled.",
      },
    },
  },
}

function createRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    age: 20 + (index % 35),
    active: index % 3 !== 0,
    role: index % 4 === 0 ? "Admin" : "User",
  }))
}

/** Rows are selected from the keyboard: Tab to the grid, then use the arrows, Home and End to move, Enter to select a row, Space to toggle it, and Shift to extend the selection. */
export const KeyboardSelection = {
  args: {
    ...Default.args,
    id: "dataGridKeyboard",
    ariaLabel: "Users",
    search: null,
    selection: [],
    isMultiSelect: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "An ARIA grid named by `ariaLabel`. One row is in the tab order: the selection anchor, or else the first row. Keys pressed in a cell's own field stay with the field.",
      },
    },
  },
}

/** With no rows to show, the footer counts no entries. */
export const Empty = {
  args: {
    ...Default.args,
    id: "dataGridEmpty",
    rows: [],
    selection: [],
    pagination: { page: 0, pageSize: 10, pageSizes: [10, 20, 50] },
  },
}

const TITLES_IT = {
  id: "Id",
  name: "Nome",
  age: "Età",
  active: "Attivo",
  role: "Ruolo",
}

/** Every text the grid shows or announces is a prop, with English as the default. */
export const Localized = {
  args: {
    ...Default.args,
    id: "dataGridLocalized",
    ariaLabel: "Utenti",
    rows: createRows(24),
    selection: [],
    columns: baseColumns.map((column) => ({
      ...column,
      title: TITLES_IT[column.id],
      isEditable: column.id === "name",
      filter: {
        ...column.filter,
        ariaLabel: `Filtra ${TITLES_IT[column.id]}`,
        minLabel: `Filtra ${TITLES_IT[column.id]}: minimo`,
        maxLabel: `Filtra ${TITLES_IT[column.id]}: massimo`,
      },
    })),
    search: { value: "", ariaLabel: "Cerca", placeholder: "Cerca…" },
    edits: { 1: { name: "Carlo" } },
    saveLabel: "Salva le modifiche",
    resetLabel: "Annulla",
    formatEditCount: (count) =>
      count === 1 ? "1 modifica" : `${count} modifiche`,
    formatRange: ({ start, end, total }) =>
      total ? `${start}–${end} di ${total} righe` : "Nessuna riga",
    pageLabel: "Pagina",
    pageSizeLabel: "Righe per pagina",
    formatPageLabel: (page) => `Vai a pagina ${page}`,
    pagination: { page: 0, pageSize: 10, pageSizes: [10, 20, 50] },
  },
}
