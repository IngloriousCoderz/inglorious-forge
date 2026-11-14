#!/usr/bin/env node
import process from "node:process"

import { pushFunctionSecrets, pushVaultSecrets } from "../src/secrets/index.js"

const USAGE = `Usage: inglorious-supabase <command>

  vault              Store the project's URL and service role key in Vault,
                     so the database can call its Edge Functions
  secrets [NAME...]  Set Edge Function secrets from supabase/functions/.env,
                     all or the ones named, and check that they arrived`

const FIRST_ARGUMENT = 2
const SUCCESS = 0
const FAILURE = 1

const [command, ...args] = process.argv.slice(FIRST_ARGUMENT)

try {
  if (command === "vault") {
    const { ref, names } = pushVaultSecrets()
    console.log(`Vault set for ${ref}: ${names.join(", ")}`)
  } else if (command === "secrets") {
    const { ref, results } = pushFunctionSecrets({ names: args })
    for (const { name, isSame } of results) {
      console.log(`${isSame ? "ok  " : "DIFF"} ${name}`)
    }
    console.log(
      `Secrets pushed to ${ref}. Deploy functions for code changes to run.`,
    )
    if (results.some(({ isSame }) => !isSame)) process.exitCode = FAILURE
  } else {
    console.log(USAGE)
    process.exitCode = command ? FAILURE : SUCCESS
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = FAILURE
}
