import fs from "fs"
import { EOL } from "os"
import path from "path"

// The Edge Functions' imports of @inglorious/supabase, whatever range the
// template wrote.
const EDGE_IMPORT = /npm:@inglorious\/supabase@[^/"]+\/edge/g

const README_SECTION = `## Edge Functions

\`supabase start\` already serves every function in \`supabase/functions/\`. While editing one, \`pnpm edge\` serves them with their logs in this terminal, reloading on every save; \`pnpm edge:check\` type-checks and lints them with Deno, which must be installed. Functions read the secrets in \`supabase/functions/.env\` when they start: after changing one, restart the stack (\`supabase stop && supabase start\`) or \`pnpm edge\`.

The first \`pnpm edge:check\` writes \`supabase/functions/deno.lock\`: commit it, so every machine and every deploy runs the functions with the same versions of their dependencies.`

/**
 * Scripts for the app's Edge Functions, which sign-in and push both add:
 * serving them while editing, and checking them with Deno.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 */
export function addEdgeSupport(targetDir, pkg) {
  pkg.scripts ??= {}
  pkg.scripts.edge = "supabase functions serve"
  pkg.scripts["edge:check"] =
    "cd supabase/functions && deno check */index.ts && deno lint"

  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${README_SECTION}${EOL}`,
  )
}

/**
 * Gives the Edge Functions the same @inglorious/supabase as the app: Deno
 * reads their imports, not package.json, so the template's range would
 * otherwise fall behind the published package.
 *
 * @param {string} targetDir
 * @param {string} range - Such as \`^0.13.0\`, from package.json.
 */
export function pinEdgeImports(targetDir, range) {
  const functionsDir = path.join(targetDir, "supabase/functions")
  if (!range || !fs.existsSync(functionsDir)) return
  for (const name of fs.readdirSync(functionsDir)) {
    const filePath = path.join(functionsDir, name, "index.ts")
    if (!fs.existsSync(filePath)) continue
    const source = fs.readFileSync(filePath, "utf-8")
    fs.writeFileSync(
      filePath,
      source.replace(EDGE_IMPORT, `npm:@inglorious/supabase@${range}/edge`),
    )
  }
}
