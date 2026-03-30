import { transformAsync } from "@babel/core"
import syntaxJsx from "@babel/plugin-syntax-jsx"
import syntaxTs from "@babel/plugin-syntax-typescript"
import { describe, expect, it } from "vitest"

import { jsxToLit } from "./visitor.js"

async function transform(code) {
  const result = await transformAsync(code, {
    babelrc: false,
    configFile: false,
    plugins: [syntaxJsx, [syntaxTs, { isTSX: true }], jsxToLit()],
  })

  return result.code
}

describe("babel visitor", () => {
  it("injects html, when, and repeat imports", async () => {
    expect(
      await transform(`
        const view = ({ items, show }) => (
          <div>
            {show && <span>{items.map(item => <b key={item.id}>{item.name}</b>)}</span>}
          </div>
        )
      `),
    ).toMatchSnapshot()
  })

  it("injects api into render methods", async () => {
    expect(
      await transform(`
        export const app = {
          render() {
            return <Form />
          },
        }
      `),
    ).toMatchSnapshot()
  })

  it("moves api to the end when it is not already last", async () => {
    expect(
      await transform(`
        export const app = {
          render(api, entity) {
            return <Form />
          },
        }
      `),
    ).toMatchSnapshot()
  })

  it("keeps in-scope components as direct renders", async () => {
    expect(
      await transform(`
        import { dataGrid as DataGrid } from "./components"

        export const app = {
          render(api) {
            return <DataGrid prop1="value" />
          },
        }
      `),
    ).toMatchSnapshot()
  })
})
