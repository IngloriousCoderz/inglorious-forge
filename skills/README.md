# Inglorious Forge skills

Agent skills for the Inglorious Forge packages: focused references that teach a coding agent the packages' APIs and conventions, loaded only when a task needs them.

Install them in a project with the [skills CLI](https://skills.sh), or let `pnpm create @inglorious/app --skills` and `pnpm create @inglorious/game` do it:

```bash
pnpm dlx skills add IngloriousCoderz/inglorious-forge
```

Start from [`forge`](forge/SKILL.md), which routes a goal to the smallest set of skills that covers it.

## Skills

- [`forge`](forge/SKILL.md): entry point, routing a goal to the right skills
- [`forge-best-practices`](forge-best-practices/SKILL.md): code style, kebab-case paths, named numbers, the newspaper metaphor
- [`app-recipe`](app-recipe/SKILL.md): building and shipping an app on Supabase
- [`utils`](utils/SKILL.md): utility functions and algorithms
- [`store`](store/SKILL.md): entity-based state management
- [`server`](server/SKILL.md): realtime WebSocket server and client middleware
- [`react-store`](react-store/SKILL.md): React bindings for the store
- [`web`](web/SKILL.md): the lit-html web framework
- [`web-best-practices`](web-best-practices/SKILL.md): folder layout, component shape, styling and typing
- [`charts`](charts/SKILL.md): SVG charts
- [`i18n`](i18n/SKILL.md): translations, plurals, formatting
- [`openui`](openui/SKILL.md): generative UI
- [`supabase`](supabase/SKILL.md): live entities, CAPTCHA, Edge Functions
- [`firebase`](firebase/SKILL.md): push notifications and analytics
- [`ssx`](ssx/SKILL.md): static and server rendering, hydration
- [`engine`](engine/SKILL.md): the 2D game engine
- [`engine-best-practices`](engine-best-practices/SKILL.md): engine testing conventions
- [`ui`](ui/SKILL.md): design system components and theming
- [`ui-best-practices`](ui-best-practices/SKILL.md): UI primitive conventions
- [`vite-plugin-jsx`](vite-plugin-jsx/SKILL.md): JSX for Inglorious Web
- [`vite-plugin-vue`](vite-plugin-vue/SKILL.md): Vue-like templates for Inglorious Web
- [`create-app`](create-app/SKILL.md): app scaffolding
- [`create-game`](create-game/SKILL.md): game scaffolding

## Verifying

`node scripts/verify-docs.mjs`, run by `pnpm lint`, checks the skills' frontmatter, links and anchors, that every skill is listed here and in `skills.sh.json`, and that every `@inglorious/*` import in the skills, the docs sites and the package READMEs resolves and exports the names it uses. A change to a package's API and its skill land in the same commit.
