#!/usr/bin/env node
import process from "node:process"

const USAGE = `Usage: inglorious-capacitor <command>

  configure            Apply the "native" settings in package.json to the
                       native projects (runs after every cap sync)
  assets [--ios] [--android]
                       Make the app icons and splash screens from the logo
  listing-assets       Capture store screenshots of the running app, and make
                       Google Play's feature graphic and icon (listing.config.js)`

const FIRST_ARGUMENT = 2
const SUCCESS = 0
const FAILURE = 1

const [command, ...flags] = process.argv.slice(FIRST_ARGUMENT)

try {
  if (command === "configure") {
    const { configure } = await import("../src/configure/index.js")
    const platforms = await configure()
    if (platforms.length) console.log(`Configured ${platforms.join(" and ")}`)
  } else if (command === "assets") {
    const { assets } = await import("../src/assets/index.js")
    await assets({ platforms: flags.map((flag) => flag.replace(/^--/, "")) })
  } else if (command === "listing-assets") {
    const { listingAssets } = await import("../src/listing-assets/index.js")
    console.log(`Listing assets in ${await listingAssets()}`)
  } else {
    console.log(USAGE)
    process.exitCode = command ? FAILURE : SUCCESS
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = FAILURE
}
