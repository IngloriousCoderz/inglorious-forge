import { transformAsync, types as t } from "@babel/core"
import syntaxJsx from "@babel/plugin-syntax-jsx"
import syntaxTs from "@babel/plugin-syntax-typescript"
import { describe, expect, it } from "vitest"

import { buildFragment, buildTemplate } from "./render.js"

function renderOnlyPlugin() {
  return {
    visitor: {
      JSXElement(path) {
        path.replaceWith(buildTemplate(path.node, path))
      },
      JSXFragment(path) {
        path.replaceWith(buildFragment(path.node, path))
      },
    },
  }
}

async function transform(code) {
  const result = await transformAsync(code, {
    babelrc: false,
    configFile: false,
    plugins: [syntaxJsx, [syntaxTs, { isTSX: true }], renderOnlyPlugin()],
  })

  return result.code
}

describe("babel render", () => {
  it("renders basic JSX elements as lit-html templates", async () => {
    expect(
      await transform("export const App = () => <div>Hello World</div>"),
    ).toMatchSnapshot()
  })

  it("renders attributes and event listeners", async () => {
    expect(
      await transform(
        `const view = () => <button className="primary" onClick={handleClick}>Save</button>`,
      ),
    ).toMatchSnapshot()
  })

  it("renders fragments and nested expressions", async () => {
    expect(
      await transform(`
        const view = () => (
          <>
            <div>{show ? "yes" : "no"}</div>
            <img src="image.png" />
          </>
        )
      `),
    ).toMatchSnapshot()
  })

  it("renders SVG self-closing tags correctly", async () => {
    expect(
      await transform(`
        const Icon = () => (
          <svg>
            <path d="M0 0h10v10H0z" />
            <circle cx="5" cy="5" r="5" />
          </svg>
        )
      `),
    ).toMatchSnapshot()
  })

  it("builds component calls for capitalized tags", () => {
    const node = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier("Card"), [], true),
      null,
      [],
      true,
    )

    expect(buildTemplate(node, null)).toMatchObject({
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: { type: "Identifier", name: "api" },
        property: { type: "Identifier", name: "render" },
      },
      arguments: [{ type: "StringLiteral", value: "card" }],
    })
  })
})
