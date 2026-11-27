#!/usr/bin/env node

import { pinCdnVersions } from "@inglorious/create-app/bin/lib/cdn.js"
import {
  readBooleanFlag,
  readValueFlag,
} from "@inglorious/create-app/bin/lib/cli.js"
import {
  INDENTATION,
  USER_ARG_START_INDEX,
} from "@inglorious/create-app/bin/lib/constants.js"
import { addDependabot } from "@inglorious/create-app/bin/lib/dependabot.js"
import { copyDir } from "@inglorious/create-app/bin/lib/file.js"
import { addGitHooks } from "@inglorious/create-app/bin/lib/hooks.js"
import {
  defaultAppIdOf,
  displayNameOf,
  validateAppId,
  validateAppName,
} from "@inglorious/create-app/bin/lib/identity.js"
import { addMobileSupport } from "@inglorious/create-app/bin/lib/mobile.js"
import { addPnpmSettings } from "@inglorious/create-app/bin/lib/pnpm.js"
import { addReleaseSupport } from "@inglorious/create-app/bin/lib/release.js"
import {
  installSkills,
  skillsCommand,
} from "@inglorious/create-app/bin/lib/skills.js"
import { pinWorkspaceVersions } from "@inglorious/create-app/bin/lib/versions.js"
import fs from "fs"
import ora from "ora"
import { EOL } from "os"
import path from "path"
import prompts from "prompts"
import { fileURLToPath } from "url"

import { SKILLS } from "./lib/skills.js"
import { addPwaSupport, writeViteConfig } from "./lib/vite.js"

const TEMPLATES = {
  js: {
    title: "JavaScript",
    description: "A vanilla JavaScript setup with Vite and Vitest",
  },
  ts: {
    title: "TypeScript",
    description: "A TypeScript setup with Vite and Vitest",
  },
  ijs: {
    title: "IngloriousScript (JS)",
    description: "A JS superset with built-in vector math",
  },
  its: {
    title: "IngloriousScript (TS)",
    description: "A TS superset with built-in vector math",
  },
  minimal: {
    title: "Minimal",
    description: "A single HTML file and no build step",
  },
}

const CDN_PACKAGES = [
  "@inglorious/utils",
  "@inglorious/store",
  "@inglorious/engine",
  "@inglorious/renderer-2d",
]

const TYPESCRIPT_TEMPLATES = new Set(["ts", "its"])

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const templatesRoot = path.join(__dirname, "../templates")
  const appTemplatesRoot = fileURLToPath(
    new URL(
      "../templates",
      import.meta.resolve("@inglorious/create-app/bin/index.js"),
    ),
  )
  const flags = parseFlags(process.argv.slice(USER_ARG_START_INDEX))

  if (flags.template && !TEMPLATES[flags.template]) {
    throw new Error(
      `Unknown template "${flags.template}". Choose one of: ${Object.keys(TEMPLATES).join(", ")}.`,
    )
  }

  let canceled = false
  const onCancel = () => {
    canceled = true
    return false
  }
  const ask = async (question) => {
    const { value } = await prompts(
      { ...question, name: "value" },
      { onCancel },
    )
    return value
  }

  const projectName =
    flags.projectName ??
    (await ask({
      type: "text",
      message: "What is your project named?",
      initial: "my-game",
    }))
  if (canceled) return cancel()

  const template =
    flags.template ??
    (await ask({
      type: "select",
      message: "Select a template",
      choices: Object.entries(TEMPLATES).map(([value, option]) => ({
        value,
        ...option,
      })),
    }))
  if (canceled) return cancel()

  const appName = flags.appName ?? displayNameOf(projectName)
  const appNameError = validateAppName(appName)
  if (appNameError !== true) throw new Error(`--app-name: ${appNameError}`)

  const isMinimal = template === "minimal"
  if (isMinimal && (flags.pwa || flags.mobile || flags.skills)) {
    console.warn(
      "PWA, mobile and agent skills options are not available for the minimal template.",
    )
  }

  let pwa = false
  let mobile = false
  let appId = null
  let withSkills = false

  if (!isMinimal) {
    pwa =
      flags.pwa ??
      (await ask({
        type: "confirm",
        message: "Make it installable and playable offline? (PWA)",
        initial: false,
      }))
    if (canceled) return cancel()

    mobile =
      flags.mobile ??
      (await ask({
        type: "confirm",
        message: "Ship it to app stores? (adds Capacitor for Android and iOS)",
        initial: false,
      }))
    if (canceled) return cancel()

    if (mobile) {
      appId =
        flags.appId ??
        (await ask({
          type: "text",
          message:
            "What is the app id? (reverse domain, fixed after the first store release)",
          initial: defaultAppIdOf(projectName),
          validate: validateAppId,
        }))
      if (canceled) return cancel()

      const appIdError = validateAppId(appId)
      if (appIdError !== true) throw new Error(`--app-id: ${appIdError}`)
    }

    withSkills =
      flags.skills ??
      (await ask({
        type: "confirm",
        message: "Add agent skills for coding agents? (Claude Code, Codex...)",
        initial: true,
      }))
    if (canceled) return cancel()
  }

  const spinner = ora(`Creating project "${projectName}"...`).start()

  try {
    const targetDir = path.join(process.cwd(), projectName)
    copyDir(path.join(templatesRoot, template), targetDir)

    replaceInFile(
      path.join(targetDir, "README.md"),
      /# my-game/,
      `# ${appName}`,
    )
    replaceInFile(
      path.join(targetDir, "index.html"),
      /<title>.*<\/title>/,
      `<title>${appName}</title>`,
    )

    if (isMinimal) {
      pinCdnVersions(targetDir, CDN_PACKAGES, (name) => {
        spinner.text = `Fetching latest version of ${name}...`
      })
      spinner.succeed(`Created ${projectName} at ${targetDir}`)
      console.log(`\nNext steps:`)
      console.log(`  cd ${projectName}`)
      console.log(`  npx serve`)
      return
    }

    const pkgPath = path.join(targetDir, "package.json")
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
    pkg.name = projectName

    addPnpmSettings(targetDir)
    addDependabot(targetDir)
    writeViteConfig(targetDir, { template, appName, pwa })

    if (pwa) {
      spinner.text = "Adding PWA support..."
      addPwaSupport(targetDir, pkg, {
        isTypeScript: TYPESCRIPT_TEMPLATES.has(template),
        mobile,
      })
    }

    if (mobile) {
      spinner.text = "Adding Capacitor support..."
      addReleaseSupport(targetDir, pkg)
      addMobileSupport(targetDir, pkg, { appId, appName }, appTemplatesRoot)
      pkg.native.assets = { background: "#1d1f33", backgroundDark: "#1d1f33" }
    }

    addGitHooks(targetDir, pkg)

    pinWorkspaceVersions(pkg, (name) => {
      spinner.text = `Fetching latest version of ${name}...`
    })
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, INDENTATION) + EOL)

    spinner.succeed(`Created ${projectName} at ${targetDir}`)

    if (withSkills && !installSkills(targetDir, SKILLS)) {
      console.warn(`\nCould not add the agent skills. To retry, run:`)
      console.warn(`  cd ${projectName}`)
      console.warn(`  ${skillsCommand(SKILLS)}`)
    }

    console.log(`\nNext steps:`)
    console.log(`  cd ${projectName}`)
    console.log(`  git init`)
    console.log(`  pnpm install`)
    console.log(`  pnpm dev`)
  } catch (error) {
    spinner.fail("Operation failed.")
    console.error(error)
  }
}

function parseFlags(args) {
  return {
    projectName: args.find((arg) => !arg.startsWith("-")) ?? null,
    appName: readValueFlag(args, "app-name"),
    appId: readValueFlag(args, "app-id"),
    template: readValueFlag(args, "template"),
    pwa: readBooleanFlag(args, "pwa"),
    mobile: readBooleanFlag(args, "mobile"),
    skills: readBooleanFlag(args, "skills"),
  }
}

function replaceInFile(filePath, pattern, replacement) {
  if (!fs.existsSync(filePath)) return
  const source = fs.readFileSync(filePath, "utf-8")
  fs.writeFileSync(filePath, source.replace(pattern, replacement))
}

function cancel() {
  console.log("Operation canceled.")
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
