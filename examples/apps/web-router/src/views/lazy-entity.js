import { html } from "@inglorious/web"

export const LazyEntity = {
  render(entity) {
    return html`<h1>Lazy Loaded Entity</h1>
      <p>
        This route was loaded lazily, but it has an associated entity already.
        Check your Network panel!
      </p>
      <p>The entity says: "${entity.message}"</p>`
  },
}
