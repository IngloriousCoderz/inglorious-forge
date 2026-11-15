#!/usr/bin/env node
// Checks the skills against themselves, and every `@inglorious/*` import in
// the skills, the docs sites and the package READMEs against the packages.
//
//   node scripts/verify-docs.mjs
//
// Exits 1 if anything fails, so it can gate CI.

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SKILLS = join(ROOT, "skills")
const SKILLS_README = join(SKILLS, "README.md")

const EXIT_PROBLEMS = 1
const EXIT_UNREADABLE = 2

/** lit-html's directives live in their own modules, not in "lit-html". */
const LIT_DIRECTIVES = new Set([
  "choose",
  "classMap",
  "createRef",
  "ref",
  "repeat",
  "styleMap",
  "unsafeHTML",
  "unsafeSVG",
  "when",
])

const problems = []

checkSkills()

try {
  checkImports(loadPackages())
} catch (error) {
  console.error(`could not read the packages: ${error.message}`)
  process.exit(EXIT_UNREADABLE)
}

if (problems.length) {
  for (const { where, message } of problems) {
    console.error(`  ${where}\n    ${message}`)
  }
  console.error(`\n${problems.length} problem(s)`)
  process.exit(EXIT_PROBLEMS)
}

process.stdout.write("docs OK\n")

function fail(where, message) {
  problems.push({ where, message })
}

function read(file) {
  return readFileSync(file, "utf8")
}

function skillFiles() {
  return readdirSync(SKILLS)
    .filter((skill) => existsSync(join(SKILLS, skill, "SKILL.md")))
    .map((skill) => ({ skill, file: join(SKILLS, skill, "SKILL.md") }))
}

function checkSkills() {
  const files = skillFiles()
  const skills = files.map(({ skill }) => skill)

  for (const { skill, file } of files) {
    const name = read(file).match(/^name:\s*(?<name>\S+)/m)?.groups.name
    if (name !== skill) {
      fail(skill, `frontmatter name is "${name}", expected "${skill}"`)
    }
    if (/^<{7} |^>{7} /m.test(read(file))) {
      fail(skill, "contains a merge conflict marker")
    }
  }

  const groupings = join(ROOT, "skills.sh.json")
  if (existsSync(groupings)) {
    const grouped = new Set(
      JSON.parse(read(groupings)).groupings?.flatMap(
        (grouping) => grouping.skills ?? [],
      ) ?? [],
    )
    for (const skill of skills) {
      if (!grouped.has(skill)) {
        fail("skills.sh.json", `"${skill}" is not listed in any grouping`)
      }
    }
    for (const skill of grouped) {
      if (!skills.includes(skill)) {
        fail("skills.sh.json", `"${skill}" is listed but has no SKILL.md`)
      }
    }
  }

  if (existsSync(SKILLS_README)) {
    const listed = new Set(
      [
        ...read(SKILLS_README).matchAll(/\]\((?<skill>[\w-]+)\/SKILL\.md\)/g),
      ].map(({ groups }) => groups.skill),
    )
    for (const skill of skills) {
      if (!listed.has(skill)) {
        fail("skills/README.md", `${skill}/SKILL.md is not listed`)
      }
    }
  }

  const pages = [...files, { skill: "skills/README.md", file: SKILLS_README }]
  for (const { skill, file } of pages) {
    if (existsSync(file)) checkLinks(skill, file)
  }
}

function checkLinks(where, file) {
  const text = read(file)

  for (const { groups } of text.matchAll(/\]\((?<target>[^)#][^)]*)\)/g)) {
    if (/^(https?:|mailto:)/.test(groups.target)) continue
    if (!existsSync(resolve(dirname(file), groups.target))) {
      fail(where, `broken link -> ${groups.target}`)
    }
  }

  const anchors = new Set(
    [...text.matchAll(/^#{1,6} (?<heading>.+)$/gm)].map(({ groups }) =>
      slug(groups.heading),
    ),
  )
  for (const { groups } of text.matchAll(/\]\(#(?<anchor>[^)]+)\)/g)) {
    if (!anchors.has(groups.anchor)) {
      fail(where, `anchor has no matching heading -> #${groups.anchor}`)
    }
  }
}

/** A heading's id, as GitHub's slugger produces it. */
function slug(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

function loadPackages() {
  const dir = join(ROOT, "packages")
  const packages = new Map()
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry, "package.json")
    if (!existsSync(file)) continue
    const pkg = JSON.parse(read(file))
    packages.set(pkg.name, {
      root: join(dir, entry),
      exports: pkg.exports ?? {},
      main: pkg.main,
    })
  }
  return packages
}

function checkImports(packages) {
  for (const { skill, file } of skillFiles()) {
    checkImportsIn(skill, read(file), packages)
  }
  for (const file of sourceDocs()) {
    checkImportsIn(relative(ROOT, file), read(file), packages)
  }
}

/** The docs sites' pages and the package READMEs. */
function sourceDocs() {
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.mdx?$/.test(entry.name)) found.push(full)
    }
  }

  const docs = join(ROOT, "docs")
  if (existsSync(docs)) walk(docs)

  const packages = join(ROOT, "packages")
  for (const name of readdirSync(packages)) {
    const readme = join(packages, name, "README.md")
    if (existsSync(readme)) found.push(readme)
  }
  return found
}

function checkImportsIn(where, text, packages) {
  const imports = text.matchAll(
    /import\s*\{(?<names>[^}]*)\}\s*from\s*["'](?<from>@inglorious\/[^"']+|lit-html)["']/g,
  )

  for (const { groups } of imports) {
    const wanted = groups.names
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name && !name.startsWith("type "))
      .map((name) => name.split(/\s+as\s+/).shift())

    if (groups.from === "lit-html") {
      for (const name of wanted) {
        if (LIT_DIRECTIVES.has(name)) {
          fail(
            where,
            `"${name}" is not exported by lit-html: import it from @inglorious/web/directives/*`,
          )
        }
      }
      continue
    }

    const { file, error } = resolveSpecifier(groups.from, packages)
    if (error) {
      fail(where, `${groups.from} — ${error}`)
      continue
    }

    const exported = collectExports(read(file), file)
    for (const name of wanted) {
      if (!exported.has(name)) {
        fail(where, `${groups.from} — "${name}" is not exported`)
      }
    }
  }
}

/** Resolves a bare specifier through its package's `exports` map. */
function resolveSpecifier(specifier, packages) {
  const { name, subpath } = specifier.match(
    /^(?<name>@[^/]+\/[^/]+|[^@/][^/]*)(?:\/(?<subpath>.+))?$/,
  ).groups
  const pkg = packages.get(name)
  if (!pkg) return { error: `no package "${name}"` }

  const key = subpath ? `./${subpath}` : "."
  const target = exportTarget(pkg, key)
  if (!target) return { error: `no exports entry for "${key}"` }

  const base = resolve(pkg.root, target)
  const candidates = [
    base,
    `${base}.js`,
    join(base, "index.js"),
    join(base, "index.jsx"),
  ]
  const file = candidates.find((candidate) => existsSync(candidate))
  return file
    ? { file }
    : { error: `resolves to a missing file: ${relative(ROOT, base)}` }
}

function exportTarget(pkg, key) {
  if (pkg.exports[key] != null) return condition(pkg.exports[key])

  if (!Object.keys(pkg.exports).length) {
    return pkg.main ? `./${pkg.main.replace(/^\.\//, "")}` : "./src/index.js"
  }

  let best
  for (const [pattern, value] of Object.entries(pkg.exports)) {
    if (!pattern.includes("*")) continue
    const [prefix, suffix = ""] = pattern.split("*")
    if (!key.startsWith(prefix) || !key.endsWith(suffix)) continue
    if (!best || prefix.length > best.prefix.length) {
      best = { prefix, suffix, value }
    }
  }
  if (!best) return undefined

  const star = key.slice(best.prefix.length, key.length - best.suffix.length)
  const target = condition(best.value)
  return typeof target === "string" ? target.replace(/\*/g, star) : undefined
}

function condition(target) {
  return typeof target === "string"
    ? target
    : (target.import ?? target.module ?? target.default ?? target.require)
}

/**
 * The names a module exports, following `export * from` into the modules it
 * re-exports, so that an import through a barrel finds its names.
 */
function collectExports(source, file, seen = new Set()) {
  const names = new Set()
  const add = (raw) => {
    const name = raw.trim().replace(/^type\s+/, "")
    if (!name) return
    names.add(name.match(/\bas\s+(?<alias>[\w$]+)$/)?.groups.alias ?? name)
  }

  const declarations = source.matchAll(
    /\bexport\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+(?<name>[\w$]+)/g,
  )
  for (const { groups } of declarations) names.add(groups.name)

  const lists = source.matchAll(/\bexport\s+(?:const\s*)?\{(?<names>[^}]*)\}/g)
  for (const { groups } of lists) groups.names.split(",").forEach(add)

  const reexports = source.matchAll(
    /\bexport\s+\*\s+from\s+"(?<from>\.[^"]+)"/g,
  )
  for (const { groups } of reexports) {
    if (seen.has(groups.from)) continue
    seen.add(groups.from)

    const target = resolve(dirname(file), groups.from)
    if (!existsSync(target)) continue

    for (const name of collectExports(read(target), target, seen)) {
      names.add(name)
    }
  }

  return names
}
