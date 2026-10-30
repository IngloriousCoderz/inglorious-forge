#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import ora from "ora"
import { EOL } from "os"
import path from "path"
import prompts from "prompts"
import { fileURLToPath } from "url"

const INDENTATION = 2
const SKILLS_REPOSITORY = "IngloriousCoderz/forge-skills"
const SKILLS = [
  "forge",
  "forge-best-practices",
  "store",
  "utils",
  "engine",
  "engine-best-practices",
]
const SKILLS_COMMAND = `pnpm dlx skills add ${SKILLS_REPOSITORY} --skill ${SKILLS.join(" ")}`

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const templatesRoot = path.join(__dirname, "../templates")

  let canceled = false

  const onCancel = () => {
    canceled = true
    return false
  }

  const { projectName, template, addSkills } = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "What is your project named?",
        initial: "my-game",
      },
      {
        type: "select",
        name: "template",
        message: "Select a template",
        choices: [
          {
            title: "Minimal",
            description: "A single HTML file for a zero-build setup",
            value: "minimal",
          },
          {
            title: "JavaScript",
            description: "A vanilla JavaScript setup with Vite",
            value: "js",
          },
          {
            title: "TypeScript",
            description: "A TypeScript setup with Vite",
            value: "ts",
          },
          {
            title: "IngloriousScript (JS)",
            description:
              "A JS superset with built-in vector math, powered by Vite",
            value: "ijs",
          },
          {
            title: "IngloriousScript (TS)",
            description:
              "A TS superset with built-in vector math, powered by Vite",
            value: "its",
          },
        ],
      },
      {
        type: (template) => (template === "minimal" ? null : "confirm"),
        name: "addSkills",
        message: "Add agent skills for coding agents? (Claude Code, Codex...)",
        initial: true,
      },
    ],
    { onCancel },
  )

  if (canceled) {
    console.log("Operation canceled.")
    return
  }

  const spinner = ora(`Creating project "${projectName}"...`).start()

  try {
    const targetDir = path.join(process.cwd(), projectName)
    const templateDir = path.join(templatesRoot, template)

    copyDir(templateDir, targetDir)

    const readmePath = path.join(targetDir, "README.md")
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, "utf-8")
      readme = readme.replace(/# my-game/, `# ${projectName}`)
      fs.writeFileSync(readmePath, readme)
    }

    if (template === "minimal") {
      spinner.succeed(`Created ${projectName} at ${targetDir}`)
      console.log(`\nNext steps:`)
      console.log(`  cd ${projectName}`)
      console.log(`  Open index.html in your browser`)
    } else {
      const pkgPath = path.join(targetDir, "package.json")
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
      pkg.name = projectName

      for (const depType of ["dependencies", "devDependencies"]) {
        if (pkg[depType]) {
          for (const [name, version] of Object.entries(pkg[depType])) {
            if (version.startsWith("workspace:")) {
              spinner.text = `Fetching latest version of ${name}...`
              pkg[depType][name] = getLatestVersion(name)
            }
          }
        }
      }

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, INDENTATION) + EOL)

      spinner.succeed(`Created ${projectName} at ${targetDir}`)

      if (addSkills && !installSkills(targetDir)) {
        console.warn(`\nCould not add the agent skills. To retry, run:`)
        console.warn(`  cd ${projectName}`)
        console.warn(`  ${SKILLS_COMMAND}`)
      }

      console.log(`\nNext steps:`)
      console.log(`  cd ${projectName}`)
      console.log(`  pnpm install`)
      console.log(`  pnpm dev`)
    }
  } catch (error) {
    spinner.fail("Operation failed.")
    console.error(error)
  }

  function copyDir(src, dest) {
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

  function installSkills(targetDir) {
    try {
      execSync(SKILLS_COMMAND, { cwd: targetDir, stdio: "inherit" })
      return true
    } catch {
      return false
    }
  }

  function getLatestVersion(packageName) {
    try {
      const version = execSync(`npm view ${packageName} version`, {
        encoding: "utf-8",
        stdio: "pipe",
      }).trim()
      return `^${version}`
    } catch {
      return "latest"
    }
  }
}

main().catch((e) => {
  console.error(e)
})
