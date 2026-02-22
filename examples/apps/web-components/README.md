# web-components

A demo verifying that third-party web components (Material Web and Shoelace) are **not recreated** when Inglorious Web re-renders the entire tree. This demonstrates lit-html's efficient DOM update strategy.

## Why This Matters

Inglorious Web uses a "re-render everything" approach where the entire template is re-executed on state changes. However, lit-html intelligently updates only the parts of the DOM that actually changed, preserving existing element instances—including custom web components.

This demo proves that web component instances maintain their identity across re-renders, which is critical for:

- Preserving internal component state
- Avoiding unnecessary re-initialization
- Maintaining smooth animations and transitions

## How Verification Works

The app uses lit-html's `ref` directive to capture actual DOM element references:

1. **Initial render**: Stores references to each web component in `initialInstances`
2. **On re-render**: Updates `componentInstances` with current element references
3. **Comparison**: Checks if it's the same JavaScript object (same memory reference)

If the reference is identical, the component was preserved—not recreated.

## Quick Start

```bash
cd examples/apps/web-components
pnpm install
pnpm dev
```

## Components Tested

- **Material Web**: `md-filled-button`, `md-switch`
- **Shoelace**: `sl-button`, `sl-switch`

## Expected Result

After clicking any button multiple times to trigger re-renders:

- All component instances should show "YES" (preserved)
- The verification status should show "SUCCESS"

This confirms that lit-html's virtual DOM diffing correctly matches existing elements to template parts by position and type, avoiding unnecessary DOM recreation.

## Files of Interest

- `src/main.js` — imports web components and mounts the app
- `src/store.js` — contains the app entity with render logic and instance tracking
