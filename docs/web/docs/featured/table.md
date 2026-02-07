---
title: Table Component
description: Data table with custom rendering, columns, selection, and theming
---

# Table Component

Flexible table for displaying tabular data with custom rendering.

## Basic Setup

```javascript
import { table } from "@inglorious/web/table"
import "@inglorious/web/table/base.css"
import "@inglorious/web/table/theme.css"

const types = {
  table,
}

const entities = {
  table: {
    type: "table",
    data: [
      { id: 1, name: "Product A", price: 100 },
      { id: 2, name: "Product B", price: 150 },
    ],
    columns: [
      { id: "id", label: "ID" },
      { id: "name", label: "Product Name" },
      { id: "price", label: "Price" },
    ],
  },
}
```

## Custom Cell Rendering

```javascript
const productTable = {
  ...table,

  renderValue(value, column) {
    // Format price
    if (column.id === "price") {
      return `$${value.toFixed(2)}`
    }

    // Format status
    if (column.formatter === "boolean") {
      return value ? "✓" : "✗"
    }

    return value
  },
}
```

## Column Configuration

```javascript
const columns = [
  { id: "id", label: "ID", width: "80px" },
  { id: "name", label: "Name", sortable: true },
  { id: "status", label: "Status", formatter: "boolean" },
  { id: "price", label: "Price", align: "right" },
]
```

## Theming

The table comes with default theme. Customize with CSS:

```css
/* Override styles */
.table {
  border-collapse: collapse;
}

.table th {
  background: #f5f5f5;
  padding: 12px;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.table tr:hover {
  background: #f9f9f9;
}
```

## Row Selection

```javascript
const selectableTable = {
  ...table,

  selectRow(entity, rowId) {
    entity.selectedRowId = rowId
  },

  render(entity, api) {
    // Custom render with click handler
    return html`<!-- render table with selection -->`
  },
}
```

**[Full Table Documentation](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/packages/web#table)**
