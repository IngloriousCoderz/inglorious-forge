import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Reports constants that read another constant declared further down the same file.
 *
 * A bundler constant-folds these and never trips the temporal dead zone, so a build
 * and even a bundled import can pass while the browser throws on load. This is the
 * check that catches it.
 *
 * Usage: node scripts/check-order.mjs [src-dir]
 */

const [, , source = "src"] = process.argv

const problems = []

for (const file of await walk(source)) {
  if (!/\.(js|ijs)$/.test(file)) continue

  const lines = (await readFile(file, "utf8")).split("\n")

  const declaredAt = new Map()
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/^(?:export )?const (\w+)/g)) {
      if (!declaredAt.has(match[1])) declaredAt.set(match[1], index)
    }
  })

  lines.forEach((line, index) => {
    const declaration = line.match(/^(?:export )?const (\w+) = (.+)$/)
    if (!declaration) return

    const [, name, expression] = declaration

    for (const identifier of expression.matchAll(/\b([A-Z][A-Z0-9_]*)\b/g)) {
      const used = identifier[1]
      const at = declaredAt.get(used)
      if (at === undefined || at <= index) continue

      problems.push(
        `${file}:${index + 1}  ${name} reads ${used}, declared on line ${at + 1}`,
      )
    }
  })
}

if (problems.length) {
  console.error(`${problems.length} constant(s) read a later declaration:`)
  problems.forEach((problem) => console.error(`  ${problem}`))
  process.exitCode = 1
} else {
  console.log(`no constant in ${source}/ reads a later declaration`)
}

async function walk(directory) {
  const found = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) found.push(...(await walk(path)))
    else found.push(path)
  }

  return found
}
