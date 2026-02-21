import fs from "node:fs/promises"
import path from "node:path"

import { build as viteBuild, createServer } from "vite"

import { getPages } from "../router/index.js"
import { generateApp } from "../scripts/app.js"
import { generateStore } from "../store/index.js"
import { loadConfig } from "../utils/config.js"
import {
  createManifest,
  determineRebuildPages,
  hashEntities,
  hashRuntime,
  loadManifest,
  saveManifest,
} from "./manifest.js"
import { generatePages } from "./pages.js"
import { copyPublicDir } from "./public.js"
import { generateRSS } from "./rss.js"
import { generateSitemap } from "./sitemap.js"
import { createViteConfig } from "./vite-config.js"

/**
 * Orchestrates the full static site build process.
 *
 * @param {Object} options - Build options.
 * @param {string} [options.rootDir="src"] - Source directory.
 * @param {string} [options.outDir="dist"] - Output directory.
 * @param {boolean} [options.incremental=true] - Whether to use incremental builds.
 * @param {boolean} [options.force=false] - Whether to force a clean output directory before building.
 * @param {Object} [options.sitemap] - Sitemap configuration.
 * @param {Object} [options.rss] - RSS configuration.
 * @returns {Promise<{changed: number, skipped: number}>} Build statistics.
 */
export async function build(options = {}) {
  const previousNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = "production"

  const config = await loadConfig(options)

  const mergedOptions = { ...config, ...options }
  const {
    rootDir = ".",
    outDir = "dist",
    incremental = true,
    force = false,
    sitemap,
    rss,
  } = mergedOptions

  const pagesDir = path.join(rootDir, "src", "pages")

  console.log("🔨 Starting build...\n")

  // Create a temporary Vite server to load modules (supports TS)
  const vite = await createServer({
    ...createViteConfig(mergedOptions),
    mode: "production",
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  })
  const loader = (p) => vite.ssrLoadModule(p)

  // 0. Get all pages to build (Fail fast if source is broken)
  const allPages = await getPages(pagesDir, mergedOptions, loader)
  console.log(`📄 Found ${allPages.length} pages\n`)

  // Load previous build manifest
  const manifest = incremental && !force ? await loadManifest(outDir) : null

  // 1. Clean and create output directory
  if (force || !manifest) {
    // Clean output directory if forced or first build
    await fs.rm(outDir, { recursive: true, force: true })
    await fs.mkdir(outDir, { recursive: true })
  } else {
    // Ensure output directory exists
    await fs.mkdir(outDir, { recursive: true })
  }

  // 2. Copy public assets before generating pages (could be useful if need to read `public/data.json`)
  await copyPublicDir(mergedOptions)

  // Determine which pages need rebuilding
  const entitiesHash = await hashEntities(rootDir)
  const runtimeHash = await hashRuntime()
  let pagesToChange = allPages
  let pagesToSkip = []

  if (manifest) {
    const result = await determineRebuildPages(
      allPages,
      manifest,
      entitiesHash,
      runtimeHash,
    )
    pagesToChange = result.pagesToBuild
    pagesToSkip = result.pagesToSkip

    if (pagesToSkip.length) {
      console.log(
        `⚡ Incremental build: ${pagesToChange.length} to change, ${pagesToSkip.length} to skip\n`,
      )
    }
  }

  // 4. Generate store with all types and initial entities
  const store = await generateStore(allPages, mergedOptions, loader)

  // 5. Render only pages that changed
  const changedPages = await generatePages(
    store,
    pagesToChange,
    mergedOptions,
    loader,
  )
  // For skipped pages, load their metadata from disk if needed for sitemap/RSS
  const skippedPages = await generatePages(
    store,
    pagesToSkip,
    { ...mergedOptions, shouldGenerateHtml: false },
    loader,
  )

  // Combine rendered and skipped pages for sitemap/RSS
  const allGeneratedPages = [...changedPages, ...skippedPages]

  if (changedPages.length) {
    // 6. Generate client-side JavaScript
    console.log("\n💾 Writing files...\n")

    // 7. Write HTML pages
    for (const page of changedPages) {
      const filePath = await writePageToDisk(page.path, page.html, outDir)
      console.log(`  ✓ ${filePath}`)
    }
  }

  // 8. Always regenerate client-side JavaScript (it's cheap and ensures consistency)
  console.log("\n📝 Generating client scripts...\n")

  const app = generateApp(store, allPages, { ...mergedOptions, isDev: false })
  await fs.writeFile(path.join(outDir, "main.js"), app, "utf-8")
  console.log(`  ✓ main.js\n`)

  // 9. Generate sitemap if enabled
  if (sitemap?.hostname) {
    console.log("\n🗺️  Generating sitemap.xml...\n")
    await generateSitemap(allGeneratedPages, { outDir, ...sitemap })
  }

  // 10. Generate RSS feed if enabled
  if (rss?.link) {
    console.log("\n📡 Generating RSS feed...\n")
    await generateRSS(allGeneratedPages, { outDir, ...rss })
  }

  // 11. Bundle with Vite
  console.log("\n📦 Bundling with Vite...\n")
  const viteConfig = {
    ...createViteConfig(mergedOptions),
    mode: "production",
  }
  await viteBuild(viteConfig)

  await vite.close()
  // 12. Cleanup
  // console.log("\n🧹 Cleaning up...\n")

  // 13. Save manifest for next build
  if (incremental) {
    const newManifest = await createManifest(
      allGeneratedPages,
      entitiesHash,
      runtimeHash,
    )
    await saveManifest(outDir, newManifest)
  }

  console.log("\n✨ Build complete!\n")

  const result = {
    changed: changedPages.length,
    skipped: skippedPages.length,
  }

  if (previousNodeEnv == null) {
    delete process.env.NODE_ENV
  } else {
    process.env.NODE_ENV = previousNodeEnv
  }

  return result
}

/**
 * Write a page to disk with proper directory structure.
 *
 * @param {string} pagePath - The URL path of the page.
 * @param {string} html - The rendered HTML content.
 * @param {string} [outDir="dist"] - The output directory.
 * @returns {Promise<string>} The absolute path of the written file.
 */
async function writePageToDisk(pagePath, html, outDir = "dist") {
  // Convert URL path to file path
  // / -> dist/index.html
  // /about -> dist/about/index.html
  // /blog/post-1 -> dist/blog/post-1/index.html

  // Remove leading slash
  const cleanPath = pagePath.replace(/^\//, "")
  const filePath = path.join(outDir, cleanPath, "index.html")

  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  // Write file
  await fs.writeFile(filePath, html, "utf-8")

  return filePath
}
