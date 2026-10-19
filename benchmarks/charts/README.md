# Charts Benchmark: Inglorious Charts vs Recharts

How much work each library does to keep a small live dashboard up to date: Recharts, and Inglorious Charts in its config and composition modes.

## The workload

Four charts, 400 × 300 each:

- a **line chart** of 100 points
- an **area chart** of 100 points
- a **bar chart** of 100 points
- a **pie chart** of 10 slices

Every 100 ms, 2 random points of **each** chart change, and all four charts update together.

All three implementations draw the same thing, so they do the same job:

- **The same data, in the same order**, from a seeded random generator (`src/shared/workload.js`).
- **The same charts:** straight segments without dots, the same colors, stroke widths and fill opacity, a grid, both axes, tooltips on every chart, and a labelled pie. The x axes show only the labels that fit, as both libraries do by default.
- **No animations.** Inglorious Charts does not animate, so Recharts' animations are turned off. Left on, they would also restart on every update, and keep the pie from ever showing.
- **One render per update.** React batches the four state updates into one render; the Inglorious variants send one event that all four charts handle.
- **The same update loop and frame counter** (`src/shared/harness.js`), in plain DOM outside both libraries, so neither re-renders to show its frame rate.

## Results

Medians of 3 runs of 20 s each, after 3 s of warm-up, on a production build:

| Implementation           | Main thread per update | Scripting | Style + layout | FPS | JS heap after GC | JS bundle (gzip) |
| ------------------------ | ---------------------- | --------- | -------------- | --- | ---------------- | ---------------- |
| Recharts                 | 22.95 ms               | 19.61 ms  | 0.77 ms        | 60  | 9.9 MB           | 167.9 kB         |
| Inglorious (config)      | 6.79 ms                | 3.16 ms   | 1.08 ms        | 60  | 2.5 MB           | 33.6 kB          |
| Inglorious (composition) | 6.91 ms                | 3.14 ms   | 1.06 ms        | 60  | 2.5 MB           | 33.8 kB          |

Measured on an Apple M2 Pro, with Chrome 155 in headless mode and Node 22, on October 19, 2026.

- Recharts does **about 3.4 times the main-thread work** of Inglorious Charts for each update, nearly all of it JavaScript: about 20 ms against 3.
- Inglorious Charts loads **about a fifth of the JavaScript** and uses **about a quarter of the memory**.
- Config and composition modes cost the same: the difference between them is within run-to-run variation, and changes direction between runs.
- All three keep up at this load, drawing 60 frames per second. The difference is how much of each update's budget is left for the rest of the app: at 10 updates a second, Recharts keeps the main thread busy about 23% of the time, Inglorious Charts about 7%.

Your numbers will differ with the hardware; the ratios are what to compare.

## What is measured

`pnpm bench` builds the pages for production, serves the build, and opens each one in Chrome. After a warm-up, it reads Chrome's own counters of main-thread work (the DevTools Protocol's `Performance.getMetrics`) at the start and end of a window, and divides by the number of updates in between:

- **Main thread per update**: all the main-thread work done during the window (scripting, style, layout and the browser's own tasks), divided by the updates made in it. Lower means more room for the rest of the app, and less battery.
- **Scripting**: the JavaScript part of it: the libraries, and the shared harness, which costs the same for all.
- **Style + layout**: the browser recalculating styles and laying out the charts.
- **FPS**: frames drawn per second. All implementations reach the display's rate at this load, so it does not tell them apart; it is there to show that none of them drops frames.
- **JS heap after GC**: memory in use at the end, after a garbage collection.
- **JS bundle (gzip)**: the JavaScript the page loads.

Each page runs 3 times, and the table shows the medians. A run in which Chrome drew fewer than 50 frames per second is redone: Chrome was holding frames back, for example because the display went to sleep, and the run would leave part of the rendering out. On a Mac, `caffeinate -d pnpm bench` keeps the display awake.

What this does **not** measure: the first render, interactions such as hovering for tooltips or dragging a brush, larger data sets, and painting, which happens off the main thread.

## Running it

```bash
pnpm install
pnpm bench
```

It uses the installed Chrome, or Playwright's Chromium (`npx playwright install chromium`). `DURATION_MS` (default 20000), `WARMUP_MS` (default 3000) and `RUNS` (default 3) set the length of the measurement:

```bash
RUNS=5 DURATION_MS=30000 pnpm bench
```

To look at the charts, run `pnpm dev` and open the index page, which links to each implementation. Measure the build, not the dev server: React's development build is several times slower than its production build.

## Earlier results

An earlier version of this benchmark reported Inglorious Charts 35% faster than Recharts, in frames per second. Those numbers were withdrawn:

- they were measured on the dev server, so React ran its development build
- Recharts animated every chart on every update
- the implementations drew different charts
- frames per second reach the display's rate and stop telling implementations apart

## License

MIT
