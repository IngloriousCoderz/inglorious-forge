export const TableRow = ({ row, onClick }) => {
  const handleClick = () => {
    onClick(row.id)
  }

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
}
