#!/usr/bin/env node
// Writes the projects in stackblitz/ from the create-app and create-game
// templates, with published versions in place of workspace ones, so StackBlitz
// can open them straight from GitHub.
//
//   node scripts/stackblitz.mjs           writes them
//   node scripts/stackblitz.mjs --check   exits 1 if they are out of date

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import * as prettier from "prettier"

import { writeViteConfig } from "../packages/create-game/bin/lib/vite.js"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUTPUT = join(ROOT, "stackblitz")
const INDENTATION = 2
const EXIT_OUTDATED = 1

const SKIPPED_FILES = new Set([
  "eslint.config.js",
  "eslint.config.ts",
  ".prettierrc.yml",
  "vercel.json",
])
const SKIPPED_SCRIPTS = new Set(["lint", "format"])
const SKIPPED_DEPENDENCIES = new Set([
  "@inglorious/eslint-config",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "@typescript/native",
  "eslint",
  "jiti",
  "prettier",
  "rollup-plugin-minify-template-literals",
  "sharp",
  "svgo",
  "vite-plugin-image-optimizer",
])

const appViteConfig = (define = "") => `import path from "node:path"
import { fileURLToPath } from "node:url"

import { hmr } from "@inglorious/vite-plugin-hmr"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({${define}
  plugins: [hmr()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
`

const PROJECTS = {
  app: {
    template: "packages/create-app/templates/js",
    title: "Inglorious App",
    description: "An Inglorious Web app, ready to run on StackBlitz",
    create: "pnpm create @inglorious/app",
    overrides: { "vite.config.js": appViteConfig() },
  },
  "app-ts": {
    template: "packages/create-app/templates/ts",
    title: "Inglorious App (TypeScript)",
    description:
      "An Inglorious Web app in TypeScript, ready to run on StackBlitz",
    create: "pnpm create @inglorious/app --template=ts",
    overrides: {
      "vite.config.ts": appViteConfig(`
  define: {
    "process.env": {},
  },
`),
    },
  },
  game: {
    template: "packages/create-game/templates/js",
    title: "Inglorious Game",
    description: "An Inglorious Engine game, ready to run on StackBlitz",
    create: "pnpm create @inglorious/game",
    overrides: { "vite.config.js": gameViteConfig("js") },
  },
  "game-ts": {
    template: "packages/create-game/templates/ts",
    title: "Inglorious Game (TypeScript)",
    description:
      "An Inglorious Engine game in TypeScript, ready to run on StackBlitz",
    create: "pnpm create @inglorious/game --template=ts",
    overrides: { "vite.config.js": gameViteConfig("ts") },
  },
}

const check = process.argv.includes("--check")
const outdated = []

for (const [name, project] of Object.entries(PROJECTS)) {
  const dir = join(OUTPUT, name)
  const files = await projectFiles(name, project)

  if (check) {
    outdated.push(...compare(dir, files))
  } else {
    rmSync(dir, { recursive: true, force: true })
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true })
      writeFileSync(join(dir, path), content)
    }
  }
}

if (outdated.length) {
  for (const path of outdated) console.error(`  ${path} is out of date`)
  console.error("\nRun `node scripts/stackblitz.mjs` to update stackblitz/.")
  process.exit(EXIT_OUTDATED)
}

function gameViteConfig(template) {
  const dir = mkdtempSync(join(tmpdir(), "stackblitz-"))
  writeViteConfig(dir, { template, pwa: false })
  const config = readFileSync(join(dir, "vite.config.js"), "utf-8")
  rmSync(dir, { recursive: true })
  return config
}

async function projectFiles(name, project) {
  const templateDir = join(ROOT, project.template)
  const files = {}

  for (const file of listFiles(templateDir)) {
    const base = file.split("/").pop()
    if (SKIPPED_FILES.has(base)) continue
    const target =
      base === "gitignore" ? file.replace(/gitignore$/, ".gitignore") : file
    files[target] = readFileSync(join(templateDir, file))
  }

  files["package.json"] = toPackageJson(
    JSON.parse(files["package.json"].toString()),
    name,
    project,
  )
  files["README.md"] = toReadme(files["README.md"].toString(), name, project)
  Object.assign(files, project.overrides)

  for (const [path, content] of Object.entries(files)) {
    if (typeof content === "string") files[path] = await format(path, content)
  }

  return files
}

function toPackageJson(pkg, name, project) {
  const result = {
    name: `inglorious-${name}`,
    version: pkg.version,
    type: pkg.type,
    private: true,
    description: project.description,
    license: pkg.license,
    scripts: Object.fromEntries(
      Object.entries(pkg.scripts).filter(([key]) => !SKIPPED_SCRIPTS.has(key)),
    ),
    dependencies: toPublished(pkg.dependencies),
    devDependencies: toPublished(pkg.devDependencies),
    stackblitz: { installDependencies: true, startCommand: "npm run dev" },
  }

  return JSON.stringify(result, null, INDENTATION) + "\n"
}

function toPublished(dependencies = {}) {
  return Object.fromEntries(
    Object.entries(dependencies)
      .filter(([dependency]) => !SKIPPED_DEPENDENCIES.has(dependency))
      .map(([dependency, version]) => [
        dependency,
        version.startsWith("workspace:") ? "latest" : version,
      ]),
  )
}

function toReadme(readme, name, project) {
  const intro = `> Running on StackBlitz with the latest published packages. To start a project of your own, run \`${project.create}\`.`

  return readme
    .split("\n")
    .filter((line) => !/`pnpm (lint|format)`/.test(line))
    .join("\n")
    .replace(/\bpnpm install\b/g, "npm install")
    .replace(/\bpnpm ([\w:]+)/g, "npm run $1")
    .replace(/^# .*$/m, `# ${project.title}\n\n${intro}`)
}

async function format(path, content) {
  const options = await prettier.resolveConfig(join(ROOT, "package.json"))
  const info = await prettier.getFileInfo(path)
  if (!info.inferredParser) return content
  return prettier.format(content, { ...options, filepath: path })
}

function compare(dir, files) {
  const expected = Object.keys(files)
  const actual = existsSync(dir) ? listFiles(dir) : []
  const paths = new Set([...expected, ...actual])

  return [...paths]
    .filter((path) => {
      const target = join(dir, path)
      if (!files[path] || !existsSync(target)) return true
      return !Buffer.from(files[path]).equals(readFileSync(target))
    })
    .map((path) => relative(ROOT, join(dir, path)))
}

function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (entry === "node_modules") return []
    if (statSync(path).isDirectory()) return listFiles(path, base)
    return [relative(base, path)]
  })
}
