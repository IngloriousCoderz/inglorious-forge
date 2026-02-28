import {
  makeStoryRender,
  notifyActionArgType,
} from "../../stories/notifyStory.js"
import { dataGrid } from "."

export default {
  title: "Data Display/DataGrid",
  tags: ["autodocs"],
  render: makeStoryRender({ dataGrid }),
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
    type: "dataGrid",
    rows: [
      { id: 1, name: "Charlie", age: 35, active: true, role: "Admin" },
      { id: 2, name: "Alice", age: 30, active: true, role: "User" },
      { id: 3, name: "Bob", age: 25, active: false, role: "User" },
      { id: 4, name: "David", age: 40, active: true, role: "Admin" },
    ],
    columns: [
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
    ],
    search: {},
    selection: [2],
    pagination: {
      page: 0,
      pageSize: 10,
    },
    // fullWidth: true,
    striped: true,
  },
}
