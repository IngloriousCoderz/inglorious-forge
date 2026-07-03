export const TableRow = (props) => {
  return (
    <tr onClick={() => props.onClick(props.row.id)}>
      <td>{props.row.rowId}</td>
      <td>{props.row.name}</td>
      <td>{props.row.value}</td>
      <td>
        <span class={`status status-${props.row.status.toLowerCase()}`}>
          {props.row.status}
        </span>
      </td>
      <td>
        <div class="progress-bar">
          <div
            class="progress-fill"
            style={{ width: `${props.row.progress}%` }}
          />
          <span class="progress-text">{props.row.progress}%</span>
        </div>
      </td>
    </tr>
  )
}
