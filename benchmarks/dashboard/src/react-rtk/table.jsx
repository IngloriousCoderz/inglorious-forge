import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"

import { TableRow } from "./row"
import { setSort, updateRow } from "./store/data.slice"
import { selectFilteredRows } from "./store/selectors"

export const Table = () => {
  const dispatch = useDispatch()
  const filteredRows = useSelector(selectFilteredRows)

  const handleSortById = useCallback(() => dispatch(setSort("id")), [dispatch])
  const handleSortByValue = useCallback(
    () => dispatch(setSort("value")),
    [dispatch],
  )
  const handleSortByProgress = useCallback(
    () => dispatch(setSort("progress")),
    [dispatch],
  )

  const handleRowClick = useCallback(
    (id) => {
      dispatch(updateRow(id))
    },
    [dispatch],
  )

  return (
    <table>
      <thead>
        <tr>
          <th onClick={handleSortById}>ID</th>
          <th>Name</th>
          <th onClick={handleSortByValue}>Value</th>
          <th>Status</th>
          <th onClick={handleSortByProgress}>Progress</th>
        </tr>
      </thead>
      <tbody>
        {filteredRows.map((row) => (
          <TableRow key={row.id} row={row} onClick={handleRowClick} />
        ))}
      </tbody>
    </table>
  )
}
