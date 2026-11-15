#!/usr/bin/env node
// Writes the index.json the skills CLI reads to install from
// https://inglorious.dev, listing each skill in the well-known folder with its
// description and files. Installing from there fetches only the skill files.
//
//   node scripts/skills-index.mjs
//
// The verifier fails while the index is out of date.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const INDENTATION = 2

export const SKILLS = join(ROOT, "docs", "forge", ".well-known", "agent-skills")
export const SKILLS_INDEX = join(SKILLS, "index.json")

const [, script] = process.argv

if (script === fileURLToPath(import.meta.url)) {
  writeFileSync(SKILLS_INDEX, skillsIndex())
}

/** The index.json for the skills as they are, as text. */
export function skillsIndex() {
  const skills = readdirSync(SKILLS)
    .filter((name) => existsSync(join(SKILLS, name, "SKILL.md")))
    .sort()
    .map((name) => ({
      name,
      description: description(join(SKILLS, name, "SKILL.md")),
      files: readdirSync(join(SKILLS, name)).sort(),
    }))

  return `${JSON.stringify({ skills }, null, INDENTATION)}\n`
}

function description(file) {
  const { value } = readFileSync(file, "utf8").match(
    /^description:\s*(?<value>.+)$/m,
  ).groups
  return value.replace(/^"(?<inner>.*)"$/, "$<inner>")
}
