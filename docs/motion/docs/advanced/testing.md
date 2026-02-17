---
title: Testing Strategy
description: How to test motion logic with unit and e2e tests.
---

# Testing Strategy

Animation systems need two layers of tests.

## Unit tests (fast, deterministic)

Use Vitest for pure logic:

- layout math
- option resolution
- registry behavior (presence/shared-layout)

These exist in `/packages/motion/src/**/*.test.js`.

## E2E tests (visual behavior)

Use Playwright for browser behavior:

- phase transitions
- remove-after-exit semantics
- shared layout and FLIP flow
- reduced motion behavior

Unit tests alone cannot prove browser rendering/animation timing, so e2e coverage is required for production confidence.
