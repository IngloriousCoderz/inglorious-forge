import { TableRow } from "./TableRow"

export const DataTable = ({ rows, onSort, onRowClick }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => onSort("id")}>ID</th>
            <th>Name</th>
            <th onClick={() => onSort("value")}>Value</th>
            <th>Status</th>
            <th onClick={() => onSort("progress")}>Progress</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <TableRow key={row.id} row={row} onClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
