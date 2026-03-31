import { html } from "@inglorious/web"

export const UserList = {
  render(entity) {
    return html`
      <div class="user-list">
        <h1>Users</h1>
        <ul>
          ${entity.users.map(
            (user) => html`
              <li>
                <a href="/users/${user.id}">${user.name}</a>
              </li>
            `,
          )}
        </ul>
      </div>
    `
  },
}
