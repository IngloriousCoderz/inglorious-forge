import fs from "fs"
import { EOL } from "os"
import path from "path"

import { VITEST_VERSION } from "./constants.js"
import { includeInNodeProject } from "./file.js"
import { importBlock } from "./imports.js"
import { layout, relative } from "./source.js"

const TEMPLATE_MESSAGE_DIR = "src/app/message"

const README_SECTION = `## Tests

\`pnpm test\` runs the unit tests once, \`pnpm test:watch\` again on every save. \`vitest.config\` builds on \`vite.config\`, so tests see the app as Vite builds it. Tests named \`*.integration.test.*\` run apart, with \`pnpm test:integration\`: they are the ones that talk to a real backend, such as the local Supabase stack.

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
 * @param {boolean} options.i18n - Tests then wait for the translations.
 * @param {boolean} options.supabase - Unit tests then get a placeholder
 *   backend, so creating the client needs no \`.env.local\`.
 */
export function addTestSupport(targetDir, pkg, options) {
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}
  pkg.devDependencies.vitest = VITEST_VERSION
  pkg.scripts.test = "vitest run --project unit"
  pkg.scripts["test:integration"] = "vitest run --project integration"
  pkg.scripts["test:watch"] = "vitest --project unit"

  const ext = options.isTypeScript ? "ts" : "js"
  fs.writeFileSync(
    path.join(targetDir, `vitest.config.${ext}`),
    vitestConfigSource(options),
  )
  if (options.isTypeScript) includeInNodeProject(targetDir, "vitest.config.ts")
  if (options.i18n) {
    const setupPath = path.join(targetDir, `src/testing/setup.${ext}`)
    fs.mkdirSync(path.dirname(setupPath), { recursive: true })
    fs.writeFileSync(setupPath, SETUP_SOURCE)
  }

  const dir = options.hasAppFeatures
    ? layout(options).message
    : TEMPLATE_MESSAGE_DIR
  const filePath = path.join(targetDir, dir, `index.test.${ext}`)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, messageTestSource(options, dir))

  appendToReadme(targetDir)
}

const SETUP_SOURCE = `import { ready } from "../i18n"

// Tests compare translated text: wait for the catalogue first.
await ready
`

function vitestConfigSource({ isTypeScript, i18n, supabase }) {
  const ext = isTypeScript ? "ts" : "js"
  const setup = i18n
    ? `
      setupFiles: ["src/testing/setup.${ext}"],`
    : ""
  const env = supabase
    ? `
            // Unit tests never reach the backend: a placeholder address lets
            // them create the Supabase client without .env.local, as in CI.
            env: {
              VITE_SUPABASE_URL: "http://127.0.0.1:54321",
              VITE_SUPABASE_ANON_KEY: "unit-tests",
            },`
    : ""
  return `import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

// The app's Vite config, so tests compile the code as the app does, with two
// projects: unit tests, which need nothing running, and integration tests,
// which talk to a real backend.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",${setup}
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            include: ["src/**/*.test.${ext}"],
            exclude: ["src/**/*.integration.test.${ext}"],${env}
          },
        },
        {
          extends: true,
          test: {
            name: "integration",
            include: ["src/**/*.integration.test.${ext}"],
            testTimeout: 30_000,
          },
        },
      ],
    },
  }),
)
`
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
