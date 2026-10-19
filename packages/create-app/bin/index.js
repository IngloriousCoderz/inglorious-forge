#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import ora from "ora"
import { EOL } from "os"
import path from "path"
import prompts from "prompts"
import { fileURLToPath } from "url"

import { addAppFeatures } from "./lib/app.js"
import { parseCliOptions } from "./lib/cli.js"
import {
  INDENTATION,
  NPM_VIEW_TIMEOUT_MS,
  USER_ARG_START_INDEX,
  VITE_APP_TEMPLATES,
} from "./lib/constants.js"
import { SYNTAXES, TEMPLATES } from "./lib/features.js"
import { copyDir } from "./lib/file.js"
import { addMobileSupport } from "./lib/mobile.js"
import { addPwaSupport } from "./lib/pwa.js"
import { askAppFeatures } from "./lib/questions.js"

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const templatesRoot = path.join(__dirname, "../templates")
  const cliOptions = parseCliOptions(process.argv.slice(USER_ARG_START_INDEX))
  validateChoice("template", cliOptions.template, TEMPLATES)
  validateChoice("syntax", cliOptions.syntax, SYNTAXES)

  let canceled = false

  const onCancel = () => {
    canceled = true
    return false
  }

  const answers = await prompts(
    [
      {
        type: cliOptions.projectName ? null : "text",
        name: "projectName",
        message: "What is your project named?",
        initial: "my-app",
      },
      {
        type: cliOptions.template ? null : "select",
        name: "baseTemplate",
        message: "Select a template",
        choices: toChoices(TEMPLATES),
      },
    ],
    { onCancel },
  )

  if (canceled) {
    console.log("Operation canceled.")
    return
  }

  const projectName = cliOptions.projectName ?? answers.projectName
  const baseTemplate = cliOptions.template ?? answers.baseTemplate

  let renderer = "lit-html"

  if (baseTemplate !== "minimal") {
    const { selectedRenderer } = await prompts(
      {
        type: cliOptions.syntax ? null : "select",
        name: "selectedRenderer",
        message: "Select a rendering syntax",
        choices: toChoices(SYNTAXES),
      },
      { onCancel },
    )

    if (canceled) {
      console.log("Operation canceled.")
      return
    }

    renderer = cliOptions.syntax ?? selectedRenderer
  } else if (cliOptions.syntax && cliOptions.syntax !== "lit-html") {
    console.warn("The minimal template is only available with lit-html.")
  }

  let features = {
    ui: false,
    routing: false,
    icons: [],
    languages: [],
    mobile: false,
    pwa: false,
  }

  if (VITE_APP_TEMPLATES.has(baseTemplate)) {
    features = await askAppFeatures(cliOptions)

    if (!features) {
      console.log("Operation canceled.")
      return
    }
  } else if (cliOptions.pwa || cliOptions.mobile) {
    console.warn(
      "PWA and mobile options are only available for JavaScript and TypeScript Vite app templates.",
    )
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

    const hasAppFeatures =
      features.ui ||
      features.routing ||
      Boolean(features.icons.length) ||
      Boolean(features.languages.length)

    if (hasAppFeatures) {
      spinner.text = "Adding app features..."
      addAppFeatures(targetDir, pkg, {
        ...features,
        projectName,
        isTypeScript: baseTemplate === "ts",
        renderer,
      })
    }

    if (features.pwa) {
      spinner.text = "Adding PWA support..."
      addPwaSupport(targetDir, pkg, projectName)
    }

    if (features.mobile) {
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

function toChoices(options) {
  return Object.entries(options).map(([value, option]) => ({
    value,
    ...option,
  }))
}

function validateChoice(flag, value, options) {
  if (value !== null && !options[value]) {
    throw new Error(
      `Unknown ${flag} "${value}". Choose one of: ${Object.keys(options).join(", ")}.`,
    )
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
