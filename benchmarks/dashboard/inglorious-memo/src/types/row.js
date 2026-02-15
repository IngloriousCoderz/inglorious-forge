import { html } from "@inglorious/web"

export const row = {
  render(entity, api) {
    const statusClass = `status status-${entity.status.toLowerCase()}`

    return html`
      <tr @click=${() => api.notify(`#table:click`, entity.id)}>
        <td>${entity.rowId}</td>
        <td>${entity.name}</td>
        <td>${entity.value}</td>
        <td>
          <span class="${statusClass}"> ${entity.status} </span>
        </td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${entity.progress}%"></div>
            <span class="progress-text">${entity.progress}%</span>
          </div>
        </td>
      </tr>
    `
  },
}
