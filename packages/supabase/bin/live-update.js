#!/usr/bin/env node
import process from "node:process"

import { build, keys, release } from "../src/live-update/cli.js"

const USAGE = `Usage: inglorious-live-update <command>

  keys               Make the signing keys, once per project
  build              Build with Vite, stamped as a release
  release            Build HEAD, sign it and publish it to Supabase Storage
  release --on-push  The same from a pre-push hook, only when main gets app changes`

const FIRST_ARGUMENT = 2
const SUCCESS = 0
const FAILURE = 1

const [command, ...flags] = process.argv.slice(FIRST_ARGUMENT)

try {
  if (command === "keys") keys()
  else if (command === "build") build()
  else if (command === "release") {
    await release({ onPush: flags.includes("--on-push") })
  } else {
    console.log(USAGE)
    process.exitCode = command ? FAILURE : SUCCESS
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = FAILURE
}
