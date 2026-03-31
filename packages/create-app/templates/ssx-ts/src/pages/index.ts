import { html } from "@inglorious/web"

export const Index = {
  render() {
    return html`
      <div>
        <h1>Welcome to SSX!</h1>
        <p>Edit <code>src/pages/index.ts</code> to get started.</p>
        <nav>
          <a href="/about">About</a>
        </nav>
      </div>
    `
  },
}

export const metadata = {
  title: "Home",
}
