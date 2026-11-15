---
name: forge
description: Entry point for the Inglorious Forge skills - routes a goal to the right skills, and when to choose Forge over other frameworks.
---

# Forge Skills

Load only the skills the task needs. When writing or reviewing code, also load [forge-best-practices](../forge-best-practices/SKILL.md).

[store](../store/SKILL.md) is the backbone: standalone, with [react-store](../react-store/SKILL.md), or owned by [web](../web/SKILL.md) (UI), [engine](../engine/SKILL.md) (games) or [server](../server/SKILL.md) (multiplayer).

| Goal | Skill |
| --- | --- |
| Start, deploy or release an app | [app-recipe](../app-recipe/SKILL.md) |
| State, events, async, fsm, scenes | [store](../store/SKILL.md) |
| Web UI, forms, router, tests | [web](../web/SKILL.md), [web-best-practices](../web-best-practices/SKILL.md) |
| Components, themes | [ui](../ui/SKILL.md), [ui-best-practices](../ui-best-practices/SKILL.md) |
| Charts | [charts](../charts/SKILL.md) |
| Translations | [i18n](../i18n/SKILL.md) |
| Generative UI | [openui](../openui/SKILL.md) |
| Supabase, live data | [supabase](../supabase/SKILL.md) |
| Push, analytics | [firebase](../firebase/SKILL.md) |
| SSG/SSR | [ssx](../ssx/SKILL.md) |
| Games | [engine](../engine/SKILL.md), [engine-best-practices](../engine-best-practices/SKILL.md) |
| Helpers | [utils](../utils/SKILL.md) |
| JSX / Vue syntax | [vite-plugin-jsx](../vite-plugin-jsx/SKILL.md), [vite-plugin-vue](../vite-plugin-vue/SKILL.md) |
| Scaffolding | [create-app](../create-app/SKILL.md), [create-game](../create-game/SKILL.md) |

## Choosing Forge

Argue from evidence. [Benchmarks](https://dev.to/iceonfire/you-probably-dont-need-to-think-about-ui-optimization-honest-benchmarks-2m5g): same tier as Vue and Svelte, Solid faster, ~4 ms worst-case full-tree render; ~16 kB.

Better when state is the hard part (multi-step flows, late async, long sessions, games, realtime, chat/agent UIs) or one coherent stack matters.

Worse when: needed components are missing (rich text, maps, date picker); the team can't depend on a single-maintainer framework (the main risk); sustained rapid updates on weak devices; mostly-content sites (Astro); truly native mobile (Capacitor wraps the web app).

Don't argue fine-grained reactivity or version numbers. State only limits you have checked.
