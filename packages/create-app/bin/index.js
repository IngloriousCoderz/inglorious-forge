#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import ora from "ora"
import { EOL } from "os"
import path from "path"
import prompts from "prompts"
import { fileURLToPath } from "url"

const CAPACITOR_VERSION = "^8.5.0"
const VITE_PLUGIN_PWA_VERSION = "^1.3.0"
const VITE_PWA_ASSETS_GENERATOR_VERSION = "^1.0.0"
const WORKBOX_WINDOW_VERSION = "^7.4.1"

const INDENTATION = 2
const AFTER_FIRST_CHARACTER_INDEX = 1
const EMPTY_LENGTH = 0
const FIRST_CHARACTER_INDEX = 0
const FIRST_ITEM_INDEX = 0
const NPM_VIEW_TIMEOUT_MS = 10_000
const USER_ARG_START_INDEX = 2
const VITE_APP_TEMPLATES = new Set(["js", "ts"])

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

  // Ask about renderer for non-minimal templates
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

    // Determine the actual template directory based on base template and renderer
    let templateName = baseTemplate
    if (baseTemplate !== "minimal" && renderer !== "lit-html") {
      templateName = `${baseTemplate}-${renderer}`
    }

    const templateDir = path.join(templatesRoot, templateName)

    // Create project directory and copy template files
    copyDir(templateDir, targetDir)

    // Update README.md with project name
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
    } else {
      // Update package.json with project name
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

      // Rename gitignore to .gitignore
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

  function getLatestVersion(packageName) {
    try {
      const version = execSync(`npm view ${packageName} version`, {
        encoding: "utf-8",
        stdio: "pipe", // Prevent npm view output from cluttering the console
        timeout: NPM_VIEW_TIMEOUT_MS,
      }).trim()
      return `^${version}`
    } catch {
      return "latest" // fallback
    }
  }
}

function parseCliOptions(args) {
  return {
    mobile: readBooleanFlag(args, "mobile"),
    pwa: readBooleanFlag(args, "pwa"),
  }
}

function readBooleanFlag(args, name) {
  if (args.includes(`--${name}`)) {
    return true
  }

  if (args.includes(`--no-${name}`)) {
    return false
  }

  return null
}

function addPwaSupport(targetDir, pkg, projectName) {
  pkg.devDependencies ??= {}
  pkg.devDependencies["vite-plugin-pwa"] = VITE_PLUGIN_PWA_VERSION
  pkg.devDependencies["@vite-pwa/assets-generator"] =
    VITE_PWA_ASSETS_GENERATOR_VERSION
  pkg.devDependencies["workbox-window"] = WORKBOX_WINDOW_VERSION

  const publicDir = path.join(targetDir, "public")
  fs.mkdirSync(publicDir, { recursive: true })

  injectPwaPluginConfig(targetDir, projectName)
  writePwaRegistration(targetDir)
  injectServiceWorkerRegistration(targetDir)
}

function addMobileSupport(targetDir, pkg, projectName) {
  pkg.dependencies ??= {}
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}

  pkg.dependencies["@capacitor/core"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/android"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/cli"] = CAPACITOR_VERSION
  pkg.devDependencies["@capacitor/ios"] = CAPACITOR_VERSION

  pkg.scripts.cap = "cap"
  pkg.scripts["mobile:sync"] = "pnpm build && cap sync"
  pkg.scripts["mobile:ios"] = "pnpm build && cap run ios"
  pkg.scripts["mobile:android"] = "pnpm build && cap run android"

  fs.writeFileSync(
    path.join(targetDir, "capacitor.config.ts"),
    createCapacitorConfigSource(projectName),
  )

  appendMobileSetupToReadme(targetDir)
}

function appendMobileSetupToReadme(targetDir) {
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) {
    return
  }

  const readme = fs.readFileSync(readmePath, "utf-8")
  if (readme.includes("## Mobile Setup")) {
    return
  }

  const mobileReadme = `
## Mobile Setup

This project includes Capacitor for Android and iOS support.

Please note that mobile development depends on external platform tooling that is not installed or managed by the CLI. If the app does not just work after scaffolding, it is usually because one or more native prerequisites are missing on the machine.

### Android

Before you run the native apps, make sure you have:

- Android Studio installed with the Android SDK: https://developer.android.com/studio
- A Java Development Kit compatible with Capacitor. Capacitor is currently known to work reliably with JDK 21, so prefer JDK 21 over newer versions if you run into Java compatibility errors.
- The SDK path available via ANDROID_HOME (for example, on macOS this is often $HOME/Library/Android/sdk)

On macOS, the following shell variables are commonly needed:

\`\`\`bash
export JAVA_HOME="/path/to/jdk-21"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
\`\`\`

### iOS

For iOS you also need the Apple toolchain and device setup on a Mac:

- Xcode from the App Store
- iOS development tools and simulator components (this can be very large, often multiple GB)
- A valid Apple Developer team / signing identity in Xcode
- Device trust setup for your iPhone in Settings > General > VPN & Device Management

The most common first-time setup commands are:

\`\`\`bash
sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
\`\`\`

If you are using a physical device, you may also need to approve the developer certificate on the device and ensure the app is signed with a valid team.

### Official resources

- Android: https://capacitorjs.com/docs/android
- iOS: https://capacitorjs.com/docs/ios
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/

Then sync and open the native project:

\`\`\`bash
pnpm mobile:sync
pnpm mobile:android
# or
pnpm mobile:ios
\`\`\`
`

  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${mobileReadme.trim()}${EOL}`,
  )
}

function injectServiceWorkerRegistration(targetDir) {
  const mainPath = findMainPath(targetDir)

  if (!mainPath) {
    return
  }

  let main = fs.readFileSync(mainPath, "utf-8")

  if (!main.includes("./pwa")) {
    main = injectAfterImport(main, "@inglorious/web", `import "./pwa"`)
  }

  fs.writeFileSync(mainPath, main)
}

function injectPwaPluginConfig(targetDir, projectName) {
  const viteConfigPath = findViteConfigPath(targetDir)

  if (!viteConfigPath) {
    return
  }

  let viteConfig = fs.readFileSync(viteConfigPath, "utf-8")

  if (!viteConfig.includes("vite-plugin-pwa")) {
    viteConfig = injectAfterImport(
      viteConfig,
      "vite",
      `import { VitePWA } from "vite-plugin-pwa"`,
    )
  }

  if (!viteConfig.includes("VitePWA(")) {
    viteConfig = viteConfig.replace(
      /plugins: \[/,
      `plugins: [${EOL}    ${createVitePwaConfig(projectName)},`,
    )
  }

  fs.writeFileSync(viteConfigPath, viteConfig)
}

function writePwaRegistration(targetDir) {
  const mainPath = findMainPath(targetDir)

  if (!mainPath) {
    return
  }

  const extension = path.extname(mainPath)
  const pwaPath = path.join(targetDir, `src/pwa${extension}`)

  fs.writeFileSync(pwaPath, createPwaRegistrationSource(extension))
}

function createPwaRegistrationSource(extension) {
  if (extension === ".ts") {
    return `/// <reference types="vite-plugin-pwa/client" />
import { isNative } from "@inglorious/web/mobile"
import { registerSW } from "virtual:pwa-register"

if (!isNative()) {
  registerSW()
}
`
  }

  return `import { isNative } from "@inglorious/web/mobile"
import { registerSW } from "virtual:pwa-register"

if (!isNative()) {
  registerSW()
}
`
}

function createVitePwaConfig(projectName) {
  return `VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      pwaAssets: {
        image: "public/logo.png",
        preset: "minimal-2023",
      },
      manifest: {
        name: "${projectName}",
        short_name: "${projectName}",
        description: "An Inglorious Web app.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
      },
    })`
}

function findMainPath(targetDir) {
  const candidates = [
    path.join(targetDir, "src/main.ts"),
    path.join(targetDir, "src/main.js"),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

function findViteConfigPath(targetDir) {
  const candidates = [
    path.join(targetDir, "vite.config.ts"),
    path.join(targetDir, "vite.config.js"),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

function injectAfterImport(source, importSource, newImport) {
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function createCapacitorConfigSource(projectName) {
  const appId = `com.inglorious.${toJavaIdentifier(projectName)}`

  return `import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "${appId}",
  appName: "${projectName}",
  webDir: "dist",
}

export default config
`
}

function toJavaIdentifier(value) {
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

main().catch((e) => {
  console.error(e)
})
