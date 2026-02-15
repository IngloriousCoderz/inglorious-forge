import { memo, useCallback } from "react"

export const TableRow = memo(
  ({ row, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(row.id)
    }, [onClick, row.id])

    return (
      <tr onClick={handleClick}>
        <td>{row.rowId}</td>
        <td>{row.name}</td>
        <td>{row.value}</td>
        <td>
          <span className={`status status-${row.status.toLowerCase()}`}>
            {row.status}
          </span>
        </td>
        <td>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${row.progress}%` }}
            />
            <span className="progress-text">{row.progress}%</span>
          </div>
        </td>
      </tr>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.row.id === nextProps.row.id &&
      prevProps.row.value === nextProps.row.value &&
      prevProps.row.status === nextProps.row.status &&
      prevProps.row.progress === nextProps.row.progress
    )
  },
)

TableRow.displayName = "TableRow"
