import fs from "fs"
import { EOL } from "os"
import path from "path"

import { copyDir, stampMigration } from "./file.js"
import { createCapacitorConfigSource } from "./mobile.js"

const FIRST_BUILD = 1

const README_SECTION = `## Live Updates

A store release is only needed for native changes. The web code inside the apps updates itself from a signed bundle in the public \`live-updates\` bucket: at launch, every hour and on each return to the foreground, the app downloads a newer bundle made for its build and switches to it the next time it goes to the background. A bundle that doesn't start within 10 seconds is rolled back and never downloaded again.

Once, before the first store build, make the signing keys:

\`\`\`bash
pnpm live:keys
\`\`\`

The private key goes to \`~/.config/<app name>/live-update.pem\`, or wherever \`LIVE_UPDATE_PRIVATE_KEY\` points: back it up, and never commit it. Whoever holds it can change the installed apps; without it, the next live update needs a new store build first. The public key goes to \`live-update.pub.pem\`: commit it, since \`capacitor.config.ts\` builds it into the apps, which then refuse anything it didn't sign.

To publish, commit and run:

\`\`\`bash
pnpm live:release
\`\`\`

It builds the committed code from a clean checkout, with the production values in \`.env\`, signs it and uploads it with the service role key it asks the Supabase CLI for (after \`supabase link\`). \`SUPABASE_URL\` and \`SUPABASE_SERVICE_ROLE_KEY\` take its place, for example in CI.

To publish on every push to \`main\` that changes the app, call it from a pre-push hook, which hands it the refs being pushed:

\`\`\`sh
printf '%s\\n' "$(cat)" | pnpm exec inglorious-live-update release --on-push
\`\`\`

Every release build is stamped with the time it was built, and an app only takes a newer bundle, so a store build never goes back. \`liveUpdate.minBuild\` in \`package.json\` is the oldest build a bundle runs on: raise it to the new build number whenever a release changes something native, such as a Capacitor plugin, a permission or \`capacitor.config.ts\`. Development builds aren't stamped, so they never update themselves.`

/**
 * Lets the native apps update their web code without the stores: the
 * plugin's config, the release scripts, the bucket and the README section.
 * The watcher itself is in src/main.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 * @param {string} projectName
 * @param {string} templatesRoot
 */
export function addLiveUpdateSupport(
  targetDir,
  pkg,
  projectName,
  templatesRoot,
) {
  pkg.scripts ??= {}
  pkg.scripts["build:release"] = "inglorious-live-update build"
  pkg.scripts["live:keys"] = "inglorious-live-update keys"
  pkg.scripts["live:release"] = "inglorious-live-update release"
  pkg.liveUpdate = { minBuild: FIRST_BUILD }

  fs.writeFileSync(
    path.join(targetDir, "capacitor.config.ts"),
    createCapacitorConfigSource(projectName, { liveUpdate: true }),
  )
  copyDir(path.join(templatesRoot, "features/live-update"), targetDir)
  stampMigration(targetDir, "live_updates.sql")
  appendToReadme(targetDir)
}

function appendToReadme(targetDir) {
  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${README_SECTION}${EOL}`,
  )
}
