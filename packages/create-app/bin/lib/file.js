import fs from "fs"
import { EOL } from "os"
import path from "path"

import {
  AFTER_FIRST_CHARACTER_INDEX,
  FIRST_CHARACTER_INDEX,
  FIRST_ITEM_INDEX,
} from "./constants.js"

export function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.name === "gitignore") {
      fs.copyFileSync(srcPath, path.join(dest, ".gitignore"))
      continue
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

export function findMainPath(targetDir) {
  const candidates = [
    path.join(targetDir, "src/main.ts"),
    path.join(targetDir, "src/main.js"),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

export function findViteConfigPath(targetDir) {
  const candidates = [
    path.join(targetDir, "vite.config.ts"),
    path.join(targetDir, "vite.config.js"),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

export function injectAfterImport(source, importSource, newImport) {
  const importLinePattern = new RegExp(
    `^([ \\t]*import .+ from "${escapeRegExp(importSource)}"\\r?\\n)`,
    "m",
  )

  if (!importLinePattern.test(source)) {
    return `${newImport}${EOL}${source}`
  }

  return source.replace(
    importLinePattern,
    (match) => `${match}${newImport}${EOL}`,
  )
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function toJavaIdentifier(value) {
  const identifier = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part, index) =>
      index === FIRST_ITEM_INDEX
        ? part
        : part.charAt(FIRST_CHARACTER_INDEX).toUpperCase() +
          part.slice(AFTER_FIRST_CHARACTER_INDEX),
    )
    .join("")
    .replace(/^[^a-z]+/, "")

  return identifier || "app"
}
