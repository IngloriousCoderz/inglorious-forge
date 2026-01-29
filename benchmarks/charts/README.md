# Charts Benchmark: Inglorious Charts vs Recharts

A performance benchmark comparing Inglorious Charts (Config and Composition modes) against Recharts.

## 🎯 What This Benchmarks

A dashboard with **4 live-updating charts**:

- **Line Chart** - 100 data points
- **Area Chart** - 100 data points
- **Bar Chart** - 100 data points
- **Pie Chart** - 10 data points

**Update frequency:** 2 random charts updated every 100ms (10 updates/second)

This simulates real-world scenarios like monitoring dashboards, analytics panels, or live data visualization.

## 📊 Results

Benchmark with **4 charts**, **100 data points each**, **100ms update interval** (10 updates/second):

| Implementation              | FPS (120Hz monitor) | Performance vs Recharts | Mental Overhead | Testability |
| --------------------------- | ------------------- | ----------------------- | --------------- | ----------- |
| 🚀 Inglorious (Config)      | **115-120 FPS**     | **+35% faster**         | Low             | Easy        |
| 🚀 Inglorious (Composition) | **115-120 FPS**     | **+35% faster**         | Medium          | Easy        |
| 📊 Recharts                 | **85-95 FPS**       | Baseline                | Low             | Hard        |

### 🎯 Key Findings

- **Inglorious Charts performs 35% better** than Recharts on high refresh rate monitors
- Both Config and Composition modes achieve **near-maximum FPS** (120Hz monitor limit)
- Recharts struggles to maintain consistent 60+ FPS, averaging **85-95 FPS**
- Inglorious Charts maintains stable performance even with **4 simultaneous chart updates**

### Key Metrics to Measure

- **FPS (Frames Per Second)**: Rendering performance during updates
- **Bundle Size**: JavaScript bundle size impact
- **Memory Usage**: Memory consumption during runtime
- **Initial Render Time**: Time to first paint
- **Update Latency**: Time between data change and visual update

## 🚀 Quick Start

### Prerequisites

```bash
pnpm install
```

### Running the Benchmark

1. Open `index.html`
2. **Comment/uncomment** the script you want to test:

```html
<!-- Uncomment ONE of these: -->
<!-- <script type="module" src="/src/inglorious-config/main.js"></script> -->
<!-- <script type="module" src="/src/inglorious-composition/main.js"></script> -->
<script type="module" src="/src/recharts/main.jsx"></script>
```

3. Start the dev server:

```bash
pnpm dev
```

4. Watch the **FPS counter** in the top-right corner
5. Observe performance for at least 30 seconds to get stable readings

### Building for Production

```bash
pnpm run build
pnpm run preview
```

This builds optimized bundles for accurate production measurements.

## 📈 Measuring Performance

### FPS Counter

Each implementation includes a built-in FPS counter. Watch it for 30+ seconds to see stable performance.

**Expected Results:**

- **60Hz monitors**: Inglorious Charts ~60 FPS, Recharts ~51 FPS
- **120Hz monitors**: Inglorious Charts 115-120 FPS, Recharts 85-95 FPS

### Browser DevTools

1. Open Chrome DevTools → Performance tab
2. Click Record
3. Let it run for 10-30 seconds
4. Stop recording
5. Analyze:
   - **FPS chart**: Inglorious Charts should maintain higher FPS
   - **Main thread activity**: Look for long tasks (Inglorious Charts should have fewer)
   - **Memory**: Check for memory leaks (both should be stable)

### Bundle Size

```bash
npm run build
ls -lh dist/assets/*.js
```

Compare the JavaScript bundle sizes between implementations.

## 🎓 What to Look For

### Development Experience

- **Smooth updates**: Charts should update without stuttering
- **FPS stability**: Should maintain 60 FPS in dev mode
- **No jank**: No visible lag or frame drops

### Production Performance

- **Bundle size**: Smaller is better (faster page loads)
- **Memory efficiency**: Lower memory usage = better for long-running dashboards
- **Update latency**: How quickly charts reflect data changes

### Code Quality

- **Simplicity**: Less code = easier to maintain
- **Testability**: Can you easily test chart rendering?
- **Flexibility**: Can you customize without fighting the library?

## 🖥️ Hardware Used for Results

Results above were measured on:

- **Device:** Mac (high refresh rate monitor - 120Hz)
- **Browser:** Chrome (latest)
- **Node:** v[version] with Vite dev server
- **OS:** macOS
- **Monitor:** 120Hz refresh rate

**Note:** On standard 60Hz monitors, Inglorious Charts consistently achieves **60 FPS** (the browser limit), while Recharts typically runs at **~51 FPS**. The advantage becomes more pronounced on high refresh rate displays.

Your results may vary based on hardware. Test on multiple devices!

## 📝 License

MIT
