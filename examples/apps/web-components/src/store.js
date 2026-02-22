import { createStore, html, ref } from "@inglorious/web"

const componentInstances = {
  mdButton: null,
  mdSwitch: null,
  slButton: null,
  slSwitch: null,
}

const initialInstances = {
  mdButton: null,
  mdSwitch: null,
  slButton: null,
  slSwitch: null,
}

function getVerificationStatus() {
  const hasInitialized =
    initialInstances.mdButton !== null &&
    initialInstances.mdSwitch !== null &&
    initialInstances.slButton !== null &&
    initialInstances.slSwitch !== null

  if (!hasInitialized) {
    return {
      status: "pending",
      message:
        "Components not yet initialized. Click a button to trigger first render.",
    }
  }

  const allMatch =
    componentInstances.mdButton === initialInstances.mdButton &&
    componentInstances.mdSwitch === initialInstances.mdSwitch &&
    componentInstances.slButton === initialInstances.slButton &&
    componentInstances.slSwitch === initialInstances.slSwitch

  if (allMatch) {
    return {
      status: "success",
      message:
        "SUCCESS: All web component instances preserved! Same DOM elements after re-render.",
    }
  }

  return {
    status: "warning",
    message:
      "WARNING: Some component instances changed. Web components may have been recreated.",
  }
}

function createInstanceRef(key) {
  return (element) => {
    if (element) {
      componentInstances[key] = element
      if (initialInstances[key] === null) {
        initialInstances[key] = element
      }
    }
  }
}

export const store = createStore({
  types: {
    app: {
      create(entity) {
        entity.renderCount = 0
        entity.mdSwitchChecked = false
        entity.slSwitchChecked = false
      },

      increment(entity) {
        entity.renderCount++
      },

      toggleMdSwitch(entity) {
        entity.mdSwitchChecked = !entity.mdSwitchChecked
      },

      toggleSlSwitch(entity) {
        entity.slSwitchChecked = !entity.slSwitchChecked
      },

      render(entity, api) {
        const renderCount = entity.renderCount
        const verification = getVerificationStatus()

        const isSameMdButton =
          componentInstances.mdButton === initialInstances.mdButton
        const isSameMdSwitch =
          componentInstances.mdSwitch === initialInstances.mdSwitch
        const isSameSlButton =
          componentInstances.slButton === initialInstances.slButton
        const isSameSlSwitch =
          componentInstances.slSwitch === initialInstances.slSwitch

        return html`
          <div class="container">
            <h1>Web Components Demo</h1>
            <p>
              This demo verifies that Material Web and Shoelace components are
              <strong>not recreated</strong> when Inglorious Web re-renders the
              entire tree.
            </p>

            <section>
              <h2>Render Stats</h2>
              <p>Full tree re-renders: <strong>${renderCount}</strong></p>
              <p>
                Click the buttons below to trigger re-renders. If DOM references
                stay the same, components are being reused by lit-html.
              </p>
            </section>

            <section>
              <h2>Material Web Components</h2>
              <p>Using <code>@material/web</code> buttons and switch:</p>
              <div class="components-row">
                <md-filled-button
                  ${ref(createInstanceRef("mdButton"))}
                  @click=${() => api.notify("increment")}
                >
                  Increment Counter
                </md-filled-button>
                <md-switch
                  ${ref(createInstanceRef("mdSwitch"))}
                  ?selected=${entity.mdSwitchChecked}
                  @click=${() => api.notify("toggleMdSwitch")}
                ></md-switch>
              </div>
              <p>
                md-filled-button preserved:
                <span
                  class="instance-id ${isSameMdButton ? "success" : "warning"}"
                  >${isSameMdButton ? "YES" : "NO"}</span
                >
              </p>
              <p>
                md-switch preserved:
                <span
                  class="instance-id ${isSameMdSwitch ? "success" : "warning"}"
                  >${isSameMdSwitch ? "YES" : "NO"}</span
                >
              </p>
            </section>

            <section>
              <h2>Shoelace Components</h2>
              <p>
                Using <code>@shoelace-style/shoelace</code> buttons and switch:
              </p>
              <div class="components-row">
                <sl-button
                  ${ref(createInstanceRef("slButton"))}
                  variant="primary"
                  @click=${() => api.notify("increment")}
                >
                  Increment Counter
                </sl-button>
                <sl-switch
                  ${ref(createInstanceRef("slSwitch"))}
                  ?checked=${entity.slSwitchChecked}
                  @sl-change=${() => api.notify("toggleSlSwitch")}
                ></sl-switch>
              </div>
              <p>
                sl-button preserved:
                <span
                  class="instance-id ${isSameSlButton ? "success" : "warning"}"
                  >${isSameSlButton ? "YES" : "NO"}</span
                >
              </p>
              <p>
                sl-switch preserved:
                <span
                  class="instance-id ${isSameSlSwitch ? "success" : "warning"}"
                  >${isSameSlSwitch ? "YES" : "NO"}</span
                >
              </p>
            </section>

            <section>
              <h2>Verification Status</h2>
              <div class="status ${verification.status}">
                ${verification.message}
              </div>
            </section>
          </div>
        `
      },
    },
  },
  autoCreateEntities: true,
})
