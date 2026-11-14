---
title: Agent Skills
description: Skills that teach coding agents the framework's conventions
---

# Agent Skills

| Question                            | Flag                       |
| ----------------------------------- | -------------------------- |
| Add agent skills for coding agents? | `--skills` / `--no-skills` |

Saying yes runs the [skills CLI](https://skills.sh) in the new project. It asks which coding agents to install for (Claude Code, Codex and others), and installs the [Inglorious Forge skills](https://github.com/IngloriousCoderz/forge-skills) that match the project:

- always: `forge`, `forge-best-practices`, `app-recipe`, `store`, `web`, `web-best-practices`;
- with SSX: `ssx`;
- with JSX or Vue: `vite-plugin-jsx` or `vite-plugin-vue`;
- with Inglorious UI: `ui`, `ui-best-practices`;
- with translations: `i18n`;
- with analytics or push: `firebase`;
- with sign-in or push: `supabase`.

`app-recipe` walks an agent through building and shipping an app on this stack: accounts to open, build order, the local backend, database rules, deploys and store releases.

If the install fails, the CLI prints the command to retry it. Skills aren't available for the `minimal` template.
