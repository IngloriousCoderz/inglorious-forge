#!/usr/bin/env node

import { execSync } from "child_process"
import fs from "fs"
import ora from "ora"
import { EOL } from "os"
import path from "path"
import prompts from "prompts"
import { fileURLToPath } from "url"

const INDENTATION = 2
const CAPACITOR_VERSION = "^8.5.0"
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
        addPwaSupport(targetDir, projectName)
      }

      if (mobile) {
        spinner.text = "Adding Capacitor support..."
        addMobileSupport(targetDir, pkg, projectName, templateName)
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

function addPwaSupport(targetDir, projectName) {
  const publicDir = path.join(targetDir, "public")
  fs.mkdirSync(publicDir, { recursive: true })
  fs.writeFileSync(path.join(publicDir, "sw.js"), createServiceWorkerSource())
  fs.writeFileSync(
    path.join(publicDir, "manifest.webmanifest"),
    JSON.stringify(createWebManifest(projectName), null, INDENTATION) + EOL,
  )

  injectPwaHeadTags(path.join(targetDir, "index.html"))
  injectServiceWorkerRegistration(targetDir)
}

function addMobileSupport(targetDir, pkg, projectName, templateName) {
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

  const extension = templateName.startsWith("ts") ? "ts" : "js"
  fs.writeFileSync(
    path.join(targetDir, `capacitor.config.${extension}`),
    createCapacitorConfigSource(projectName, extension),
  )
}

function createServiceWorkerSource() {
  return `const CACHE_NAME = "inglorious-app-v1"
const APP_SHELL = ["/", "/index.html", "/logo.png", "/style.css"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => key === CACHE_NAME ? null : caches.delete(key))),
      ),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/index.html")
        }

        throw new Error("Network request failed")
      })
    }),
  )
})
`
}

function createWebManifest(projectName) {
  return {
    name: projectName,
    short_name: projectName,
    description: "An Inglorious Web app.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}

function injectPwaHeadTags(indexPath) {
  let index = fs.readFileSync(indexPath, "utf-8")

  if (!index.includes('rel="manifest"')) {
    index = index.replace(
      /^([ \t]*<link rel="icon"[^>]*>\r?\n)/m,
      `$1    <link rel="manifest" href="/manifest.webmanifest" />${EOL}`,
    )
  }

  if (!index.includes('name="theme-color"')) {
    index = index.replace(
      /^([ \t]*<meta name="viewport"[^>]*>\r?\n)/m,
      `$1    <meta name="theme-color" content="#111827" />${EOL}`,
    )
  }

  fs.writeFileSync(indexPath, index)
}

function injectServiceWorkerRegistration(targetDir) {
  const mainPath = findMainPath(targetDir)

  if (!mainPath) {
    return
  }

  let main = fs.readFileSync(mainPath, "utf-8")

  if (!main.includes("@inglorious/web/mobile")) {
    main = main.replace(
      /^([ \t]*import \{ mount \} from "@inglorious\/web"\r?\n)/m,
      (match) =>
        `${match}import { isNative } from "@inglorious/web/mobile"${EOL}`,
    )
  }

  if (!main.includes('navigator.serviceWorker.register("/sw.js")')) {
    main = `${main.trimEnd()}${EOL}${EOL}if (!isNative() && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
}${EOL}`
  }

  fs.writeFileSync(mainPath, main)
}

function findMainPath(targetDir) {
  const candidates = [
    path.join(targetDir, "src/main.ts"),
    path.join(targetDir, "src/main.js"),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

function createCapacitorConfigSource(projectName, extension) {
  const appId = `com.inglorious.${toJavaIdentifier(projectName)}`

  if (extension === "ts") {
    return `import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "${appId}",
  appName: "${projectName}",
  webDir: "dist",
}

export default config
`
  }

  return `/** @type {import("@capacitor/cli").CapacitorConfig} */
const config = {
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
