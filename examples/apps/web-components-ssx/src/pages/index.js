import { html } from "@inglorious/web"

// Shoelace theme CSS (works on both SSR and client)
import "@shoelace-style/shoelace/dist/themes/light.css"

// Material Web components - these have SSR support via lit-element-hydrate-support.js
import "@material/web/button/filled-button.js"
import "@material/web/button/outlined-button.js"
import "@material/web/switch/switch.js"

// Shoelace components - NO SSR support, only import on client
// They will render as plain <sl-*> tags on server and upgrade on client
if (!import.meta.env.SSR) {
  import("@shoelace-style/shoelace/dist/components/button/button.js")
  import("@shoelace-style/shoelace/dist/components/switch/switch.js")
}

export const Index = {
  create(entity) {
    entity.count = 0
    entity.mdSwitch = false
    entity.slSwitch = false
    entity.name = ""
  },

  increment(entity) {
    entity.count++
  },

  toggleMdSwitch(entity) {
    entity.mdSwitch = !entity.mdSwitch
  },

  toggleSlSwitch(entity) {
    entity.slSwitch = !entity.slSwitch
  },

  updateName(entity, name) {
    entity.name = name
  },

  render(entity, api) {
    return html`
      <style>
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, sans-serif;
        }
        section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        h2 {
          margin-top: 0;
          color: #555;
        }
        .components-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin: 16px 0;
        }
        .success {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
        }
      </style>

      <div class="container">
        <h1>Web Components + SSX Demo</h1>
        <p>
          This page uses Material Web and Shoelace components with SSX. The
          components are rendered as custom elements during SSR, then upgrade on
          the client when their definitions load.
        </p>

        <section>
          <h2>Render Count: ${entity.count}</h2>
          <p>
            Click buttons to trigger re-renders and verify components persist.
          </p>
        </section>

        <section>
          <h2>Material Web Components</h2>
          <p>Using <code>@material/web</code>:</p>
          <div class="components-row">
            <md-filled-button @click=${() => api.notify("increment")}>
              Increment (${entity.count})
            </md-filled-button>
            <md-outlined-button @click=${() => api.notify("increment")}>
              Also Increment
            </md-outlined-button>
            <md-switch
              ?selected=${entity.mdSwitch}
              @click=${() => api.notify("toggleMdSwitch")}
            >
            </md-switch>
            <span>Switch: ${entity.mdSwitch ? "ON" : "OFF"}</span>
          </div>
        </section>

        <section>
          <h2>Shoelace Components</h2>
          <p>Using <code>@shoelace-style/shoelace</code>:</p>
          <div class="components-row">
            <sl-button
              variant="primary"
              @click=${() => api.notify("increment")}
            >
              Increment (${entity.count})
            </sl-button>
            <sl-button
              variant="default"
              @click=${() => api.notify("increment")}
            >
              Also Increment
            </sl-button>
            <sl-switch
              ?checked=${entity.slSwitch}
              @sl-change=${() => api.notify("toggleSlSwitch")}
            >
              Toggle me
            </sl-switch>
          </div>
          <p>Switch state: ${entity.slSwitch ? "ON" : "OFF"}</p>
        </section>

        <section>
          <h2>Verification</h2>
          <div class="success">
            If you can see styled buttons and switches above, web components are
            working with SSX!
          </div>
        </section>
      </div>
    `
  },
}
