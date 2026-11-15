---
name: create-game
description: Scaffolding new Inglorious Engine game projects with create-game.
---

# @inglorious/create-game

`pnpm create @inglorious/game` (or npm/yarn) prompts for name and template. Same flow as [create-app](../create-app/SKILL.md).

Templates: `minimal` (no bundler), `js`, `ts`, `ijs`/`its` (IngloriousScript, see [engine](../engine/SKILL.md)).

Every template has a `vercel.json` deploying only `main`.

Every template but `minimal` offers to install the game skills (`forge`, `forge-best-practices`, `store`, `utils`, `engine`, `engine-best-practices`) via the skills CLI; on failure it prints the retry command.
