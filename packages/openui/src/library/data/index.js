import { EditableTable } from "./editable-table.js"
import { EntityList } from "./entity-list.js"
import { ListBlock, ListItem } from "./list-block.js"
import { Col, Table } from "./table.js"

export const dataGroup = {
  name: "Tables and lists",
  components: [Table, Col, EditableTable, EntityList, ListBlock, ListItem],
  notes: [
    "- Table is column-oriented: each Col holds every value of its column, in row order.",
    '- Cells can be components: Col("Status", [Tag("Open", null, "sm", "success"), Tag("Closed")])',
    "- EntityList for a few label and value pairs, such as a receipt; ListBlock for a ranked or illustrated list.",
  ],
}
