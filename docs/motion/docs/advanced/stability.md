---
title: Stability Policy
description: Stable and experimental areas in @inglorious/motion.
---

# Stability Policy

## Stable

- Variant lifecycle via `motionVariantChange`
- Exit orchestration via `removeWithMotion`
- Host phase classes (`--start`, `--active`, `--end`, `--variant-*`)
- Presence `mode: "wait"` queue semantics

## Experimental

- Shared layout transitions (`motionLayoutId`)
- FLIP heuristics and layout thresholds

## Versioning intent

- Patch: fixes and non-breaking behavior improvements
- Minor: additive options and handlers
- Major: breaking API or semantic changes

When behavior must change, compatibility aliases are kept when feasible for at least one minor cycle.
