#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import ora from "ora"
import { EOL } from "os"
import path from "path"
import prompts from "prompts"
import { fileURLToPath } from "url"

import { parseCliOptions } from "./lib/cli.js"
import {
  EMPTY_LENGTH,
  INDENTATION,
  NPM_VIEW_TIMEOUT_MS,
  USER_ARG_START_INDEX,
  VITE_APP_TEMPLATES,
} from "./lib/constants.js"
import { copyDir } from "./lib/file.js"
import { addMobileSupport } from "./lib/mobile.js"
import { addPwaSupport } from "./lib/pwa.js"

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const templatesRoot = path.join(__dirname, "../templates")
  const cliOptions = parseCliOptions(process.argv.slice(USER_ARG_START_INDEX))

  let canceled = false

  const onCancel = () => {
    canceled = true
    return false
  }

  const { projectName, baseTemplate } = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "What is your project named?",
        initial: "my-app",
      },
      {
        type: "select",
        name: "baseTemplate",
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
            title: "SSX (JavaScript)",
            description: "Static Site Xecution with JavaScript",
            value: "ssx-js",
          },
          {
            title: "SSX (TypeScript)",
            description: "Static Site Xecution with TypeScript",
            value: "ssx-ts",
          },
        ],
      },
    ],
    { onCancel },
  )

  if (canceled) {
    console.log("Operation canceled.")
    return
  }

  let renderer = "lit-html"
  let pwa = cliOptions.pwa === true
  let mobile = cliOptions.mobile === true

  if (baseTemplate !== "minimal") {
    const { selectedRenderer } = await prompts(
      {
        type: "select",
        name: "selectedRenderer",
        message: "Select a rendering syntax",
        choices: [
          {
            title: "lit-html (default)",
            description: "Tagged template literals (html`<div>...</div>`)",
            value: "lit-html",
          },
          {
            title: "JSX",
            description: "JSX/TSX syntax (<div>...</div>)",
            value: "jsx",
          },
          {
            title: "Vue",
            description: "Vue SFC-style templates",
            value: "vue",
          },
        ],
      },
      { onCancel },
    )

    if (canceled) {
      console.log("Operation canceled.")
      return
    }

    renderer = selectedRenderer
  }

  const supportsAppFeatures = VITE_APP_TEMPLATES.has(baseTemplate)

  if (supportsAppFeatures) {
    const featureQuestions = []

    if (cliOptions.pwa === null) {
      featureQuestions.push({
        type: "confirm",
        name: "pwa",
        message: "Enable PWA support?",
        initial: false,
      })
    }

    if (cliOptions.mobile === null) {
      featureQuestions.push({
        type: "confirm",
        name: "mobile",
        message: "Add hybrid mobile support with Capacitor?",
        initial: false,
      })
    }

    if (featureQuestions.length > EMPTY_LENGTH) {
      const answers = await prompts(featureQuestions, { onCancel })

      if (canceled) {
        console.log("Operation canceled.")
        return
      }

      pwa = cliOptions.pwa === true ? true : answers.pwa === true
      mobile = cliOptions.mobile === true ? true : answers.mobile === true
    }
  } else if (pwa || mobile) {
    console.warn(
      "PWA and mobile options are only available for JavaScript and TypeScript Vite app templates.",
    )
    pwa = false
    mobile = false
  }

  const spinner = ora(`Creating project "${projectName}"...`).start()

  try {
    const targetDir = path.join(process.cwd(), projectName)

    let templateName = baseTemplate
    if (baseTemplate !== "minimal" && renderer !== "lit-html") {
      templateName = `${baseTemplate}-${renderer}`
    }

    const templateDir = path.join(templatesRoot, templateName)
    copyDir(templateDir, targetDir)

    const readmePath = path.join(targetDir, "README.md")
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, "utf-8")
      readme = readme.replace(/# my-app/, `# ${projectName}`)
      fs.writeFileSync(readmePath, readme)
    }

    if (baseTemplate === "minimal") {
      spinner.succeed(`Created ${projectName} at ${targetDir}`)
      console.log(`\nNext steps:`)
      console.log(`  cd ${projectName}`)
      console.log(`  Open index.html in your browser`)
      return
    }

    const pkgPath = path.join(targetDir, "package.json")
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
    pkg.name = projectName

    if (pwa) {
      spinner.text = "Adding PWA support..."
      addPwaSupport(targetDir, pkg, projectName)
    }

    if (mobile) {
      spinner.text = "Adding Capacitor support..."
      addMobileSupport(targetDir, pkg, projectName)
    }

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
    console.log(`\nNext steps:`)
    console.log(`  cd ${projectName}`)
    console.log(`  pnpm install`)
    console.log(`  pnpm dev`)
  } catch (error) {
    spinner.fail("Operation failed.")
    console.error(error)
  }
}

function getLatestVersion(packageName) {
  try {
    const version = execSync(`npm view ${packageName} version`, {
      encoding: "utf-8",
      stdio: "pipe",
      timeout: NPM_VIEW_TIMEOUT_MS,
    }).trim()
    return `^${version}`
  } catch {
    return "latest"
  }
}

main().catch((e) => {
  console.error(e)
})
