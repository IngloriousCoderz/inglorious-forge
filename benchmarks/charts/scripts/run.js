import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

import { chromium } from "playwright"
import { preview } from "vite"

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const DIST = path.join(ROOT, "dist")
const DURATION_MS = Number(process.env.DURATION_MS ?? 20000)
const WARMUP_MS = Number(process.env.WARMUP_MS ?? 3000)
const RUNS = Number(process.env.RUNS ?? 3)
const PORT = 4321
const MIN_FPS = Number(process.env.MIN_FPS ?? 50)
const MAX_ATTEMPTS = 3

const PAGES = [
  ["Recharts", "recharts.html"],
  ["Inglorious (config)", "inglorious-config.html"],
  ["Inglorious (composition)", "inglorious-composition.html"],
]

const server = await preview({
  root: ROOT,
  logLevel: "silent",
  preview: { port: PORT, strictPort: true },
})
const browser = await launchChrome()

try {
  const rows = []
  for (const [name, page] of PAGES) {
    const runs = []
    for (let run = 0; run < RUNS; run++) {
      runs.push(await measureValidRun(`http://localhost:${PORT}/${page}`))
    }
    rows.push({ name, ...medians(runs), bundleKb: getBundleKb(page) })
    console.error(`measured ${name}`)
  }
  printTable(rows)
} finally {
  await browser.close()
  await server.close()
}

async function launchChrome() {
  const args = [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
  ]
  try {
    return await chromium.launch({ channel: "chrome", args })
  } catch {
    return await chromium.launch({ args })
  }
}

async function measureValidRun(url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await measure(url)
    console.error(`  ${url}: ${result.fps.toFixed(0)} FPS`)
    if (result.fps >= MIN_FPS) return result
  }
  throw new Error(
    `${url} drew fewer than ${MIN_FPS} frames per second in ${MAX_ATTEMPTS} attempts: Chrome is holding frames back, so the measurement would leave rendering out.`,
  )
}

async function measure(url) {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1000 },
  })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Performance.enable")

  await page.goto(url)
  await page.bringToFront()
  await page.waitForFunction(() => window.__benchmark?.updates > 0, null, {
    polling: 100,
  })
  await page.waitForTimeout(WARMUP_MS)

  const before = await sample(page, cdp)
  await page.waitForTimeout(DURATION_MS)
  const after = await sample(page, cdp)
  await cdp.send("HeapProfiler.collectGarbage")
  const heap = await sample(page, cdp)
  await page.close()

  if (errors.length) throw new Error(`${url}: ${errors.join("; ")}`)

  const updates = after.updates - before.updates
  const seconds = (after.time - before.time) / 1000
  const perUpdate = (metric) =>
    ((after.metrics[metric] - before.metrics[metric]) * 1000) / updates

  return {
    taskMs: perUpdate("TaskDuration"),
    scriptMs: perUpdate("ScriptDuration"),
    layoutMs: perUpdate("LayoutDuration") + perUpdate("RecalcStyleDuration"),
    fps: (after.frames - before.frames) / seconds,
    heapMb: heap.metrics.JSHeapUsedSize / 1024 / 1024,
  }
}

async function sample(page, cdp) {
  const { metrics } = await cdp.send("Performance.getMetrics")
  const stats = await page.evaluate(() => ({ ...window.__benchmark }))
  return {
    ...stats,
    time: Date.now(),
    metrics: Object.fromEntries(
      metrics.map(({ name, value }) => [name, value]),
    ),
  }
}

function medians(runs) {
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  }
  return Object.fromEntries(
    Object.keys(runs[0]).map((key) => [
      key,
      median(runs.map((run) => run[key])),
    ]),
  )
}

function getBundleKb(page) {
  const html = readFileSync(path.join(DIST, page), "utf8")
  const scripts = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)]
  const bytes = scripts.reduce(
    (total, [, file]) =>
      total + gzipSync(readFileSync(path.join(DIST, file))).length,
    0,
  )
  return bytes / 1024
}

function printTable(rows) {
  const fixed = (value, digits = 1) => value.toFixed(digits)
  console.log(
    `\nMedians of ${RUNS} runs of ${DURATION_MS / 1000}s each, after ${WARMUP_MS / 1000}s of warm-up.\n`,
  )
  console.log(
    "| Implementation | Main thread per update | Scripting | Style + layout | FPS | JS heap after GC | JS bundle (gzip) |",
  )
  console.log("| --- | --- | --- | --- | --- | --- | --- |")
  for (const row of rows) {
    console.log(
      `| ${row.name} | ${fixed(row.taskMs, 2)} ms | ${fixed(row.scriptMs, 2)} ms | ${fixed(row.layoutMs, 2)} ms | ${fixed(row.fps, 0)} | ${fixed(row.heapMb)} MB | ${fixed(row.bundleKb)} kB |`,
    )
  }
}
