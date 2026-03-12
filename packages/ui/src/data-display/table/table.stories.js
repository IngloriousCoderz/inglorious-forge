import { createRender } from "../../stories/notifyStory.js"
import { table } from "."

export default {
  title: "Data Display/Table",
  tags: ["autodocs"],
  render: createRender(table),
  argTypes: {
    columns: { control: "object", description: "Column definitions." },
    rows: { control: "object", description: "Row records." },
    isFullWidth: { control: "boolean", description: "Stretch table width." },
    isStriped: { control: "boolean", description: "Enable zebra rows." },
    onRowClick: { action: "onRowClick" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Base table primitive with overridable `renderHeaderCell`, `renderRow`, and `renderCell` sub-renders.",
      },
    },
  },
}

export const Default = {
  args: {
    columns: [
      { id: "name", label: "Name" },
      { id: "role", label: "Role" },
      { id: "score", label: "Score", align: "right" },
    ],
    rows: [
      { id: "u1", name: "Ada", role: "Maintainer", score: 98 },
      { id: "u2", name: "Max", role: "Contributor", score: 87 },
      { id: "u3", name: "Lin", role: "Designer", score: 91 },
    ],
    isFullWidth: true,
    isStriped: true,
  },
}
