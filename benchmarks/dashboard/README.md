# Dashboard Benchmark: React vs Inglorious Web

A real-world performance benchmark comparing React (with and without optimizations) against Inglorious Web framework.

## 🎯 What This Benchmarks

A live-updating dashboard with:

- **1000 rows** of data updating in real-time
- **10 random rows** updated every 10ms (100 updates/second)
- **4 charts** displaying live data
- **Filtering and sorting** capabilities
- **FPS counter** and performance metrics

This simulates real-world scenarios like factory monitoring dashboards, stock tickers, or logistics tracking systems.

## 📊 Results

Benchmark with **1000 rows**, **10ms update interval** (100 updates/second):

| Implementation                         | FPS (dev) | FPS (prod) | Bundle Size | Mental Overhead | Testability |
| -------------------------------------- | --------- | ---------- | ----------- | --------------- | ----------- |
| 🐌 React Naive                         | 52        | 113        | 62.39kB     | Low             | 😱 Hard     |
| 🏃 React Memoized                      | 112       | 120        | 62.58kB     | High            | 😱 Hard     |
| 🐢 React + RTK                         | 32        | 92         | 72.21kB     | Very High       | 😊 Good     |
| 🐢⚡ React + RTK Memoized              | 87        | 118        | 72.30kB     | Very High       | 😊 Good     |
| 🧩 React + RTK + Inglorious            | 29        | 74         | 79.18kB     | Very High       | 😊 Good     |
| 🧩⚡ React + RTK + Inglorious Memoized | 69        | 93         | 79.29kB     | Very High       | 😊 Good     |
| ⚛️ React + Inglorious Store            | 33        | 95         | 71.98kB     | Medium          | 😊 Good     |
| ⚛️⚡ React + Inglorious Store Memoized | 87        | 120        | 72.05kB     | Medium          | 😊 Good     |
| 🚀 Inglorious (no memo)                | 105       | 120        | 16.29kB     | Low             | 🎉 Easy     |
| 🚀 Inglorious (with memo)              | 110       | 120        | 16.35kB     | Low             | 🎉 Easy     |

### Key Findings

✅ **Development experience still favors Inglorious defaults** - Inglorious Web is ~105 FPS in dev without memoization; non-memo React/store variants stay much lower (29-52 FPS).  
✅ **Bundle size advantage** - Inglorious Web is roughly **4-5x smaller** (16.29-16.35kB vs 62.39-79.29kB).  
✅ **Memoization is decisive on React integrations** - adding memoization lifts dev FPS substantially (for example `react-rtk` 32 -> 87, `react-inglorious` 33 -> 87).  
✅ **RTK + adapter path remains the slowest React branch** - even memoized, `react-rtk-inglorious` trails the other memoized React variants.  
✅ **StrictMode was not the main culprit** - removing it improved little compared to the gains from render memoization.  
✅ **Testing simplicity** - Inglorious Web types are trivially testable, React hooks require special tooling

### Interpretation Of The Current Numbers

1. The largest performance lever in React variants is render strategy, not only store choice. Memoized variants consistently outperform their non-memo counterparts.
2. RTK slices add noticeable cost versus plain React/in native Inglorious Store integration, especially in dev mode and bundle size.
3. Migration adapters introduce additional overhead on top of RTK slices (`react-rtk-inglorious` is the weakest React branch in both baseline and memoized modes), but this can be considered a reasonable tradeoff for incremental migration toward native Inglorious types with lower rewrite risk
4. Native Inglorious Web remains fast by default and barely benefits from optional memoization, which suggests its default update model is already efficient for this workload.

## 🎯 What This Means

### For Development

During development, when you're iterating rapidly:

- **React Naive / store baselines:** Sluggish (29-52 FPS) unless you add memoization
- **React memoized integrations:** Much better (69-112 FPS), but require extra render discipline
- **Inglorious Web:** Smooth by default (105-110 FPS), with or without memoization

### For Production

Several variants reach ~120 FPS in prod, but not equally:

- **React:** Can match top FPS when memoized, but with larger bundles and more optimization ceremony
- **Inglorious:** Reaches top FPS out of the box with much smaller bundles and simpler baseline code

### The Real Cost of React

Even when React can catch up in production:

1. **You still need explicit memoization discipline** across components/selectors to get competitive numbers
2. **Your bundle is 62-79KB** vs Inglorious Web's ~16KB (slower page loads globally)
3. **Baseline dev experience is significantly slower** (29-52 FPS vs 105+ FPS)
4. **Your code is more complex** (dependency arrays, memo wrappers, etc.)
5. **Junior devs will struggle** - memoization is a minefield

### The Inglorious Advantage

- ✅ **Fast from day one** - 105+ FPS in dev with no memoization requirements
- ✅ **Tiny bundle** - ~16KB means faster loads on 3G/4G globally
- ✅ **Simple code** - No component memoization required, ever
- ✅ **Better DX** - Code without friction, iterate quickly
- ✅ **Junior-friendly** - Naive code is performant code

## 🚀 Quick Start

### Prerequisites

```bash
npm install
```

### Running the Benchmark

1. Open `index.html`
2. **Comment/uncomment** the script you want to test:

```html
<!-- Uncomment ONE of these: -->
<script type="module" src="/src/react/main.jsx"></script>
<!-- <script type="module" src="/src/react-memo/main.jsx"></script> -->
<!-- <script type="module" src="/src/react-rtk/main.jsx"></script> -->
<!-- <script type="module" src="/src/react-rtk-memo/main.jsx"></script> -->
<!-- <script type="module" src="/src/react-rtk-inglorious/main.jsx"></script> -->
<!-- <script type="module" src="/src/react-rtk-inglorious-memo/main.jsx"></script> -->
<!-- <script type="module" src="/src/react-inglorious/main.jsx"></script> -->
<!-- <script type="module" src="/src/react-inglorious-memo/main.jsx"></script> -->
<!-- <script type="module" src="/src/inglorious/main.js"></script> -->
<!-- <script type="module" src="/src/inglorious-memo/main.js"></script> -->
```

3. Start the dev server:

```bash
npm run dev
```

4. Open your browser and watch the FPS counter
5. Try different implementations by switching the script tag

### Testing Production Builds

To see production performance:

```bash
npm run build
npm run preview
```

**Note:** React's production build includes:

- Dead code elimination
- Minification
- Optimized reconciliation
- RTK dev middleware removed

Inglorious Web's production build is similar in size because the dev build is already optimized.

### Testing on Slower Machines

For more dramatic differences, test on:

- Lower-end laptops
- Chrome DevTools with CPU throttling (6x slowdown)
- Mobile devices

Or increase the stress by editing the parameters in the `./src/data.js` file:

```javascript
export const ROWS_TO_GENERATE = 1000
export const ROWS_TO_UPDATE = 10
export const UPDATE_FREQUENCY = 10
```

## 🔍 What Each Implementation Shows

### React Naive (`/src/react/`)

- **No optimization** - Every state change re-renders everything
- **Simple code** - Easy to understand
- **Poor dev performance** - ~52 FPS during development
- **Decent production result** - ~113 FPS in prod build
- **The problem:** Painful dev experience, Virtual DOM overhead

### React Memoized (`/src/react-memo/`)

- **Fully optimized** - `React.memo`, `useMemo`, `useCallback` everywhere
- **Complex code** - Dependency arrays, custom comparators
- **Better dev performance** - ~112 FPS
- **Top prod performance** - ~120 FPS
- **The tradeoff:** strong gains, but with extra memoization discipline and complexity

### React + RTK (`/src/react-rtk/`)

- **"Best practices"** - Redux Toolkit with `createSelector`
- **Most boilerplate** - slices, actions, reducers, selectors
- **Slow dev baseline** - ~32 FPS
- **Larger bundle** - ~72KB vs ~62KB for plain React
- **The reality:** More code, worse results, painful dev experience

### React + RTK (Memo) (`/src/react-rtk-memo/`)

- **Same RTK architecture** with memoized React components
- **Use case:** compare render memoization impact without changing store model
- **The point:** isolates React render optimization from RTK slice/store costs

### React + RTK + Inglorious Store (`/src/react-rtk-inglorious/`)

- **Hybrid migration path** - RTK slices converted with `convertSlice()`
- **Same React ergonomics** - `react-redux` hooks and RTK action creators still work
- **Inglorious runtime** - state updates run through Inglorious Store internals
- **The tradeoff:** Useful for migration, but still carries RTK-style ceremony

### React + RTK + Inglorious Store (Memo) (`/src/react-rtk-inglorious-memo/`)

- **Same migration architecture** with memoized React components
- **Use case:** measure adapter + RTK costs with render memoization enabled
- **The point:** keeps migration path comparable to other memoized React variants

### React + Inglorious Store (`/src/react-inglorious/`)

- **React UI, native Inglorious store** - no RTK slices and no migration adapters
- **Same integration style** - still uses `react-redux` hooks and Provider
- **Cleaner update path** - direct entity/type handlers with Mutative under the hood
- **The point:** isolates RTK/adapters overhead while keeping React rendering comparable

### React + Inglorious Store (Memo) (`/src/react-inglorious-memo/`)

- **Same native Inglorious store integration** with memoized React components
- **Use case:** isolate React memoization gains while keeping non-RTK store logic
- **The point:** direct baseline-vs-memo comparison for this integration style

### Inglorious (no memo) (`/src/inglorious/`)

- **No memoization** - Straightforward entity-based architecture
- **Clean code** - Separation of data (entities) and behavior (types)
- **Peak baseline performance** - ~105 FPS in dev and ~120 FPS in prod
- **Tiny bundle** - ~16.3KB
- **The point:** Fast by default, no tricks needed

### Inglorious (with memo) (`/src/inglorious-memo/`)

- **Optional memoization** - Uses `compute()` for derived state
- **Similar performance** - ~110 FPS dev and ~120 FPS prod
- **Same bundle class** - ~16.3KB (negligible difference)
- **The lesson:** Memoization is a convenience, not a requirement

## 💡 Key Concepts Demonstrated

### Why React Struggles in Development

1. **Virtual DOM overhead** - Dev builds include extra checks and warnings
2. **Cascade re-renders** - Parent updates trigger children unnecessarily
3. **Store integration + slice pipeline costs** - RTK slice updates and adapter conversion paths add work, especially at high update frequency
4. **Framework complexity** - Lifecycle hooks, dependency tracking

### Why Inglorious Web Excels

1. **No Virtual DOM** - Direct DOM updates via lit-html
2. **Data Orientation** - Clean separation of concerns
3. **Fast by default** - No optimization tricks required
4. **Optimized from the start** - Dev and prod builds are similar
5. **Simple mental model** - Mutate state, framework handles the rest

### Bundle Size Impact

- **~16KB vs 62-79KB** = large transfer savings
- On 3G: ~500ms faster load time
- Critical for global audiences (India, Brazil, Africa, rural areas)
- Better Core Web Vitals scores out of the box

## 🧪 Testability Comparison

Testing is where architectural choices really shine or fail.

### React Hooks: Testing Nightmare 😱

```javascript
// Testing a component with hooks requires special setup
import { renderHook, act } from "@testing-library/react"

// Can't test hooks in isolation - need renderHook wrapper
const { result } = renderHook(() => useCustomHook())

// Act wrappers everywhere
act(() => {
  result.current.doSomething()
})

// Testing components requires full React tree
import { render, fireEvent } from "@testing-library/react"
const { getByText } = render(<MyComponent />)

// Mocking hooks is painful
jest.mock("./useCustomHook", () => ({
  useCustomHook: () => mockData,
}))
```

**Problems:**

- ❌ Can't test hooks in isolation without `renderHook`
- ❌ Need `@testing-library/react-hooks` dependency
- ❌ `act()` warnings everywhere
- ❌ Difficult to mock custom hooks
- ❌ Must render entire component tree to test logic
- ❌ Async testing is particularly painful

### React + RTK: Much Better 😊

```javascript
// Redux makes testing easier - logic is separate from components
import { store } from "./store"
import { updateRow } from "./dataSlice"

// Test reducers in isolation
test("updateRow changes row value", () => {
  const state = { rows: [{ id: 1, value: 100 }] }
  const newState = reducer(state, updateRow(1))
  expect(newState.rows[0].value).not.toBe(100)
})

// Test selectors
import { selectFilteredRows } from "./selectors"
const filtered = selectFilteredRows(mockState)
expect(filtered).toHaveLength(5)

// Components are simpler to test (just pass props from store)
```

**Improvements:**

- ✅ Logic lives in reducers (pure functions)
- ✅ Selectors are testable in isolation
- ✅ Components become simpler (just receive props)

**But:**

- ⚠️ Still need to test action creators
- ⚠️ Integration tests require store setup
- ⚠️ Boilerplate for every test file

### Inglorious Web: Trivially Easy 🎉

```javascript
// Test entity handlers with the trigger() utility
import { trigger, render } from "@inglorious/web/test"
import { row } from "./types/row.js"

test("randomUpdate changes row value", () => {
  const { entity } = trigger(
    { type: "row", id: 1, value: 100, progress: 50 },
    row.randomUpdate,
  )

  expect(entity.value).not.toBe(100)
  expect(entity.progress).not.toBe(50)
  // Original entity unchanged - pure function behavior
})

test("click handler can dispatch events", () => {
  const { entity, events } = trigger(
    { type: "row", id: 1, value: 100 },
    row.click,
  )

  expect(entity.value).not.toBe(100)
  // If the handler called api.notify(), events array contains them
})

// Test render output by rendering to actual HTML
test("row renders correctly", () => {
  const entity = {
    id: 1,
    name: "Item 1",
    value: 500,
    status: "Active",
    progress: 75,
    rowId: 1,
  }

  const mockApi = {
    notify: jest.fn(),
  }

  const template = row.render(entity, mockApi)
  const html = render(template)

  expect(html).toContain("Item 1")
  expect(html).toContain("500")
  expect(html).toContain("75%")
  expect(html).toContain("status-active")
})

test("row click handler is wired correctly", () => {
  const entity = {
    id: 1,
    name: "Item 1",
    value: 500,
    status: "Active",
    progress: 75,
    rowId: 1,
  }
  const mockApi = { notify: jest.fn() }

  const template = row.render(entity, mockApi)
  const html = render(template)

  // Verify the onclick handler exists in the HTML
  expect(html).toContain("onclick")
})

// Test computed state
import { compute } from "@inglorious/store"

test("filtered rows excludes non-matching items", () => {
  const getFiltered = compute(
    (rows, filter) => rows.filter((r) => r.name.includes(filter)),
    () => mockRows,
    () => "Item",
  )

  const result = getFiltered()
  expect(result).toHaveLength(3)
})

// Integration test: create a real store
import { createStore } from "@inglorious/store"

test("full user interaction flow", () => {
  const store = createStore({
    types: { row },
    entities: {
      row_1: { type: "row", id: 1, value: 100 },
    },
  })

  store.notify("#row_1:randomUpdate")

  expect(store.entities.row_1.value).not.toBe(100)
})
```

**Why it's better:**

- ✅ **`trigger()` utility for pure testing** - handlers wrapped in Mutative.js return new state without mutation
- ✅ **`render()` utility for HTML testing** - render lit-html templates to actual HTML strings
- ✅ **Test events dispatched** - `trigger()` captures `api.notify()` calls
- ✅ **Types are just objects with functions** - no special React testing setup
- ✅ **Pure functions everywhere** - deterministic, easy to reason about
- ✅ **String assertions are simple** - `.toContain()` is intuitive and clear
- ✅ **No mocking required** - pass in the data you want to test
- ✅ **No React testing library needed** - just plain JavaScript testing
- ✅ **Fast tests** - no component mounting, no DOM manipulation
- ✅ **Integration tests are straightforward** - create store, notify events, assert state

### The Secret: Mutative.js

Inglorious handlers **look** impure (they mutate entities directly), but the framework wraps them in [Mutative.js](https://mutative.js.org/), which provides:

- ✅ Structural sharing (like Immer/RTK)
- ✅ 2-6x faster than Immer
- ✅ Pure function behavior without pure function syntax
- ✅ Time-travel debugging compatibility
- ✅ Easy testing with `trigger()`

**You write:**

```javascript
function increment(entity, payload) {
  entity.value += payload.amount // Looks impure
}
```

**The framework executes:**

```javascript
const newEntity = produce(entity, (draft) => {
  draft.value += payload.amount // Actually pure via Mutative
})
```

Best of both worlds: mutable syntax, immutable benefits.

### Testing Utilities

Inglorious provides two simple testing utilities via `@inglorious/web/test`:

#### `trigger(entity, handler, payload?, api?)`

Execute an entity handler and get back the new state plus any events dispatched:

```javascript
const { entity, events } = trigger({ type: "counter", value: 10 }, increment, {
  amount: 5,
})

expect(entity.value).toBe(15)
expect(events).toHaveLength(0)
```

#### `render(template)`

Render a lit-html template to an HTML string for testing:

```javascript
const template = myType.render(entity, api)
const html = render(template)

expect(html).toContain("expected content")
```

That's it. Two utilities, zero complexity.

### Testing Comparison Summary

| Aspect             | React Hooks            | React + RTK | Inglorious                |
| ------------------ | ---------------------- | ----------- | ------------------------- |
| Unit test setup    | Complex                | Medium      | Trivial                   |
| Dependencies       | @testing-library/react | redux, jest | None (just a test runner) |
| Mocking complexity | High                   | Medium      | Low                       |
| Test speed         | Slow (DOM)             | Medium      | Fast (pure functions)     |
| Learning curve     | Steep                  | Medium      | Shallow                   |
| Async testing      | Painful                | Medium      | Easy                      |
| Pure functions     | No                     | Yes         | Yes (via Mutative)        |
| Event testing      | Hard                   | Medium      | Easy (`trigger()`)        |
| Render testing     | DOM queries            | DOM queries | String assertions         |

### Real-World Impact

**React Hooks Project:**

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/react-hooks \
  @testing-library/jest-dom
```

- 3+ testing libraries required
- 100+ lines of test setup boilerplate
- Developers avoid testing hooks → bugs in production

**Inglorious Project:**

```bash
npm install --save-dev vitest  # or jest, or node:test
```

- Just a test runner
- Two optional utilities: `trigger()` and `render()`
- Developers actually write tests → fewer bugs

**The Bottom Line:**
If your framework makes testing painful, developers won't test. If testing is trivial, they will. Inglorious makes testing so easy that you'll actually write tests.

## 🎓 Learning Resources

- [Inglorious Web Documentation](https://github.com/IngloriousCoderz/inglorious-forge/blob/main/packages/web/README.md)
- [Inglorious Store Documentation](https://github.com/IngloriousCoderz/inglorious-forge/blob/main/packages/store/README.md)
- [ECS Architecture Explained](https://en.wikipedia.org/wiki/Entity_component_system)

## 📝 License

MIT

## 🤝 Contributing

This benchmark is designed to be fair and accurate. If you see opportunities to improve any implementation while keeping the comparison valid, PRs are welcome!

### Guidelines for Contributions

- Keep implementations comparable (same features, same data)
- No artificial handicaps
- Document any optimization techniques used
- Update benchmark results with your hardware specs

## 🖥️ Hardware Used for Results

Results above were measured on:

- **Device:** MacBook Pro 16in 2023
- **Browser:** Chrome 144
- **Node:** v22 with Vite dev server
- **OS:** macOS Tahoe

Your results may vary based on hardware. Test on multiple devices!

## ❓ FAQ

**Q: Why are RTK variants slower than plain React in this benchmark?**  
A: The data suggests it's not mainly middleware. The strongest signal is:

- RTK slice/update machinery is costlier under this update rate
- React render strategy (memoized vs non-memoized) has a large effect
- Adapter-based conversion (`react-rtk-inglorious`) adds extra overhead on top of RTK slices

Dev middleware can contribute in development, but it does not explain the full gap, especially because the adapter path is slower even with a different runtime store.

**Q: React hits 120 FPS in production. Doesn't that mean it's just as good?**  
A: Production parity doesn't tell the full story:

- Baseline dev experience is still much slower (29-52 FPS vs 105+ FPS)
- You shipped far more JavaScript (62-79KB vs ~16KB)
- You still need explicit memoization to approach top numbers
- Your code is more complex and harder to maintain
- Junior devs will struggle with the optimization burden

**Q: Is memoization ever useful in Inglorious?**  
A: Yes! Use `compute()` for genuinely expensive calculations (complex data transformations, heavy algorithms). But you don't need it for basic rendering performance like you do in React.

**Q: How do I measure FPS on my machine?**  
A: Each implementation has a built-in FPS counter in the top-right. Watch it for 30 seconds to see stable performance. The browser's Performance tab also shows detailed frame timing.

**Q: Can I use this in production?**  
A: This is a benchmark/demo. For production apps, use the actual Inglorious Web framework from npm: `npm install @inglorious/web`

**Q: What about React 19's automatic memoization?**  
A: React 19's compiler helps, but:

- It doesn't eliminate Virtual DOM overhead
- Bundle size remains the same
- You're trusting a black box vs understanding your architecture
- Inglorious is already this fast without compiler magic

**Q: Why not compare against Svelte, Solid, or other modern frameworks?**  
A: Great idea! PRs welcome. This benchmark focuses on React because it's the most widely used and represents the current industry standard.

We'd love to see comparisons with other frameworks. Our expectations:

- **Svelte/Solid:** Likely slightly better performance than Inglorious Web (runes are fast!), but at what cost?
  - Component-centric architecture scatters state across components
  - Signal-based reactivity requires tracking dependencies
  - Lifecycle events and component lifecycle complexity
  - **Requires compilation** - you can't run Svelte in the browser directly
  - Inglorious philosophy: "Good enough performance without compilation > marginally better performance with compilation"

- **Vue:** Likely similar tradeoffs to Svelte - good performance, but component-centric with Options/Composition API complexity

- **Qwik:** Interesting resumability model, but still component-centric and requires heavy build tooling

**Inglorious's differentiator isn't just speed** - it's the combination of:

- ✅ Entity-based, event-driven architecture (state lives in the store, not scattered in components)
- ✅ No compilation required (can run directly in browsers via import maps)
- ✅ No lifecycle events (components are pure render functions)
- ✅ Predictable, explicit behavior (no magic reactivity tracking)
- ✅ "Good enough" is enough (105+ FPS without build-tool-dependent optimization games)

If you value **architectural clarity and zero build complexity** over squeezing out the last 5% of performance, Inglorious Web wins. If you need every millisecond, Svelte might edge ahead - but you'll pay for it in tooling complexity.

**Q: What about testing? I heard React hooks are hard to test.**  
A: You heard right. Testing React hooks requires `@testing-library/react-hooks`, `act()` wrappers, and constant fighting with async state updates. It's so painful that many developers skip testing hooks entirely.

Redux improves this significantly - reducers and selectors are pure functions, easy to test.

Inglorious takes it further: **entity handlers are pure functions wrapped in Mutative.js**. Use the `trigger()` utility to test them:

```javascript
import { trigger } from "@inglorious/store/test"

test("increment adds to value", () => {
  const { entity, events } = trigger(
    { type: "counter", value: 10 },
    increment,
    { amount: 5 },
  )

  expect(entity.value).toBe(15)
  expect(events).toEqual([]) // No events dispatched
})
```

You write mutable-looking code (`entity.value += 1`), but the framework makes it pure via Mutative.js. Testing gets the benefits of immutability without the ceremony of immutable syntax.

When testing is this easy, developers actually write tests. When testing requires 10 lines of setup, they don't.

## 📢 Feedback

Found this useful? Have questions? Open an issue or reach out!

---

**TL;DR:**

React needs manual optimization to be fast in development. Even with optimization, it ships 4x more JavaScript. Inglorious is fast by default in dev and prod, with a fraction of the bundle size and zero memoization required. Same features, better performance, simpler code. 🚀
