import { removeWithMotion, withMotion } from "@inglorious/motion"
import { html, repeat } from "@inglorious/web"

const panelBase = {
  toggle(entity, _payload, api) {
    const variant = entity.motionVariant === "visible" ? "hidden" : "visible"
    api.notify(`#${entity.id}:motionVariantChange`, variant)
  },

  render(entity, api) {
    return html`
      <section class="card">
        <h2>Motion Type</h2>
        <p>Variant: <code>${entity.motionVariant}</code></p>
        <button @click=${() => api.notify(`#${entity.id}:toggle`)}>
          Toggle variant
        </button>
      </section>
    `
  },
}

const motionPanel = [
  panelBase,
  withMotion({
    classPrefix: "demo-motion",
    initial: "visible",
    variants: {
      visible: {
        frames: [
          { opacity: 0.35, transform: "translateY(14px) scale(0.985)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        options: { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      },
      hidden: {
        frames: [
          { opacity: 1, transform: "translateY(0) scale(1)" },
          { opacity: 0.45, transform: "translateY(6px) scale(0.99)" },
        ],
        options: { duration: 180, easing: "ease-in-out" },
      },
      exit: {
        frames: [
          { opacity: 1, transform: "translateX(0)" },
          { opacity: 0, transform: "translateX(18px)" },
        ],
        options: { duration: 160, easing: "ease-in" },
      },
    },
  }),
]

const toastBase = {
  dismiss(entity, _payload, api) {
    if (entity.motionVariant === "exit") {
      return
    }

    removeWithMotion(api, entity.id, { exitVariant: "exit" })
  },

  render(entity, api) {
    return html`
      <article class="toast">
        <div>
          <strong>${entity.title}</strong>
          <p>${entity.message}</p>
        </div>

        <button @click=${() => api.notify(`#${entity.id}:dismiss`)}>
          Dismiss
        </button>
      </article>
    `
  },
}

const toast = [
  toastBase,
  withMotion({
    classPrefix: "demo-toast",
    initial: "visible",
    exitVariant: "exit",
    variants: {
      visible: {
        frames: [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        options: { duration: 220, easing: "ease-out" },
      },
      exit: {
        frames: [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-10px)" },
        ],
        options: { duration: 170, easing: "ease-in" },
      },
    },
  }),
]

const playground = {
  addToast(entity, _payload, api) {
    const next = entity.nextToast
    entity.nextToast += 1

    api.notify("add", {
      id: `toast-${next}`,
      type: "toast",
      title: `Toast #${next}`,
      message: "Exit waits for animation end before remove.",
      motionVariant: "visible",
    })
  },

  render(entity, api) {
    const toasts = Object.values(api.getEntities()).filter(
      (it) => it.type === "toast",
    )

    return html`
      <section class="stack">
        <h2>Presence Demo</h2>

        <button @click=${() => api.notify(`#${entity.id}:addToast`)}>
          Add toast
        </button>

        <div class="toast-list">
          ${repeat(
            toasts,
            (item) => item.id,
            (item) => api.render(item.id),
          )}
        </div>
      </section>
    `
  },
}

export const types = {
  motionPanel,
  playground,
  toast,
}
