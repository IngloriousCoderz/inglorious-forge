import "jsr:@supabase/functions-js@2/edge-runtime.d.ts"

import { STATUS_CODE } from "jsr:@std/http@1/status"
import {
  currentUser,
  env,
  eraseUser,
  json,
  serve,
} from "npm:@inglorious/supabase@^0.9.0/edge"
import { createClient } from "npm:@supabase/supabase-js@2"

// The Storage buckets where each user's files sit in a folder named after
// their id: those folders go with the account.
const USER_BUCKETS: string[] = []

// Erases the signed-in caller's account. Their rows go through the
// `on delete cascade` foreign keys to `auth.users`.
serve(
  async (req) => {
    const db = createClient(
      env("SUPABASE_URL"),
      env("SUPABASE_SERVICE_ROLE_KEY"),
    )
    const user = await currentUser(db, req)
    if (!user) return json({ error: "Not signed in" }, STATUS_CODE.Unauthorized)

    await eraseUser(db, user.id, { buckets: USER_BUCKETS })
    return json({ erased: true })
  },
  { fallbackError: "erase failed" },
)
