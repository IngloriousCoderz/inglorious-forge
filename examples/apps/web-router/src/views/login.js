import { html } from "@inglorious/web"

export const LoginPage = {
  navigate(entity, payload) {
    if (payload.to === "/login") {
      entity.redirectTo = payload.redirectTo
    }
  },

  fieldChange(entity, { name, value }) {
    entity[name] = value
  },

  submit(entity, _, api) {
    localStorage.setItem(
      "user",
      JSON.stringify({ username: entity.username, password: entity.password }),
    )
    api.notify("navigate", { to: entity.redirectTo || "/", replace: true })
  },

  render(entity, api) {
    return html`<h1>Login</h1>
      <form
        @submit=${(event) => {
          event.preventDefault()
          api.notify(`#${entity.id}:submit`)
        }}
      >
        <div>
          <input
            name="username"
            placeholder="Username"
            .value=${entity.username}
            @input=${(event) =>
              api.notify(`#${entity.id}:fieldChange`, {
                name: "username",
                value: event.target.value,
              })}
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            .value=${entity.password}
            @input=${(event) =>
              api.notify(`#${entity.id}:fieldChange`, {
                name: "password",
                value: event.target.value,
              })}
          />
        </div>
        <div>
          <button>Login</button>
        </div>
      </form>`
  },
}
