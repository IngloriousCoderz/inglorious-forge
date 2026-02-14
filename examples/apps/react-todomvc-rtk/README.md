# React TodoMVC RTK - Inglorious Migration Adapter Demo

A TodoMVC implementation that models state with **Redux Toolkit slices** and runs on **@inglorious/store** through the RTK migration adapters.

## What this demo shows

- RTK state modeling with `createSlice`
- Slice conversion via `convertSlice` from `@inglorious/store/migration/rtk`
- RTK action compatibility via `createRTKCompatDispatch`
- Standard React integration with `react-redux`

## Run

```bash
cd examples/apps/react-todomvc-rtk
pnpm install
pnpm dev
```

## Key files

- `src/store/types.js` - RTK slices + conversion to Inglorious types
- `src/store/index.js` - store setup + RTK-compatible dispatch bridge
- `src/store/types.test.js` - tests dispatching RTK slice actions through the adapter
