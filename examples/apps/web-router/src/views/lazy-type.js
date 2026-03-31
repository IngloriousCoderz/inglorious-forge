import { html } from "@inglorious/web"

export const LazyType = {
  render() {
    return html`<h1>Lazy Loaded Type</h1>
      <p>
        This route was loaded lazily, and it creates an entity on the fly. Check
        your Network panel!
      </p>`
  },
}
