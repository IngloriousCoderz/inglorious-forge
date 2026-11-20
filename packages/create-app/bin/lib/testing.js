import fs from "fs"
import { EOL } from "os"
import path from "path"

import { VITEST_VERSION } from "./constants.js"
import { importBlock } from "./imports.js"
import { layout, relative } from "./source.js"

const TEMPLATE_MESSAGE_DIR = "src/app/message"

const README_SECTION = `## Tests

\`pnpm test\` runs the tests once, \`pnpm test:watch\` again on every save. Vitest reads \`vite.config\`, so tests see the app as Vite builds it.

A handler is a function from an entity to a changed entity, so most tests need no browser: \`trigger\` from \`@inglorious/web/test\` runs a handler on a copy of an entity and returns the result with the events it sent. \`src/**/message/index.test.*\` is the example to copy.`

/**
 * Adds Vitest and a first test, for the example Message type, so the app is
 * tested from its first commit.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 * @param {object} options
 * @param {boolean} options.isTypeScript
 * @param {"lit-html" | "jsx" | "vue"} options.renderer
 * @param {boolean} options.routing
 * @param {boolean} options.hasAppFeatures - Whether the app's source was
 *   rewritten, which moves the Message type to the home screen.
 */
export function addTestSupport(targetDir, pkg, options) {
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}
  pkg.devDependencies.vitest = VITEST_VERSION
  pkg.scripts.test = "vitest run"
  pkg.scripts["test:watch"] = "vitest"

  const dir = options.hasAppFeatures
    ? layout(options).message
    : TEMPLATE_MESSAGE_DIR
  const ext = options.isTypeScript ? "ts" : "js"
  const filePath = path.join(targetDir, dir, `index.test.${ext}`)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, messageTestSource(options, dir))

  appendToReadme(targetDir)
}

function messageTestSource({ isTypeScript, renderer }, dir) {
  const imports = [
    'import { trigger } from "@inglorious/web/test"',
    'import { describe, expect, it } from "vitest"',
  ]
  if (isTypeScript) {
    imports.push(
      `import type { MessageEntity } from "${relative(dir, "types")}"`,
    )
  }
  if (renderer === "vue") {
    const line = 'import { Message } from "./index.vue"'
    imports.push(
      isTypeScript
        ? `// @ts-expect-error - Handled by @inglorious/vite-plugin-vue\n${line}`
        : line,
    )
  } else {
    imports.push('import { Message } from "."')
  }

  const annotation = isTypeScript ? ": MessageEntity" : ""

  return `${importBlock(imports)}

const message${annotation} = { id: "message1", type: "Message", who: "world" }

describe("Message", () => {
  it("shouts on click", () => {
    const { entity } = trigger(message, Message.click)

    expect(entity.isUpperCase).toBe(true)
  })

  it("speaks normally on a second click", () => {
    const { entity } = trigger({ ...message, isUpperCase: true }, Message.click)

    expect(entity.isUpperCase).toBe(false)
  })
})
`
}

function appendToReadme(targetDir) {
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  // Right after the project setup, before the services' long sections.
  const marker = "\n## Mobile Setup"
  const updated = readme.includes(marker)
    ? readme.replace(marker, `\n${README_SECTION}\n${marker}`)
    : `${readme.trimEnd()}${EOL}${EOL}${README_SECTION}${EOL}`
  fs.writeFileSync(readmePath, updated)
}
