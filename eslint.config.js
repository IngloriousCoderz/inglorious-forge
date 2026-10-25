import nodeConfig from "@inglorious/eslint-config/node"
import { defineConfig, globalIgnores } from "eslint/config"

// Every workspace lints itself with its own config. This one is only reached by a file that
// no workspace config covers, when the pre-commit hook runs ESLint from the root: without
// it, ESLint stops with "couldn't find an eslint.config.* file" and the commit with it.
//
// The benchmarks are React, Solid, Svelte and Vue apps written the way each of those
// ecosystems writes them, so they are left out rather than held to this repo's rules.
export default defineConfig([globalIgnores(["benchmarks/**"]), ...nodeConfig])
