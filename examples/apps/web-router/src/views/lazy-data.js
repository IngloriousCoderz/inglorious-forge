import { html } from "@inglorious/web"

export const LazyData = {
  async routeChange(entity, payload, api) {
    if (payload.route !== entity.id) return
    if (entity.posts.length) return

    const entityId = entity.id
    const data = await fetchData()
    api.notify(`#${entityId}:fetchDataSuccess`, data)
  },

  fetchDataSuccess(entity, data) {
    entity.posts = data
  },

  render(entity) {
    return html`<div class="post-list">
      <h1>Lazy Loaded Type And Data</h1>
      <ul>
        ${entity.posts.map((post) => html` <li>${post.text}</li> `)}
      </ul>
    </div>`
  },
}

async function fetchData() {
  return await [
    { id: "1", text: "Hello from Alice!", authorId: "1" },
    { id: "2", text: "Hello from Bob!", authorId: "2" },
  ]
}
