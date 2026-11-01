import "jsr:@supabase/functions-js@2/edge-runtime.d.ts"

import { decodeBase64 } from "jsr:@std/encoding@1/base64"
import { decodeBase64Url, encodeBase64Url } from "jsr:@std/encoding@1/base64url"
import { createClient } from "npm:@supabase/supabase-js@2"

interface ServiceAccount {
  project_id: string
  client_email: string
  private_key: string
}

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPE = "https://www.googleapis.com/auth/firebase.messaging"
const MS_PER_SECOND = 1000
const TOKEN_LIFETIME_S = 3600
const RENEW_MARGIN_S = 60
const STATUS_FORBIDDEN = 403
const STATUS_BAD_REQUEST = 400
const STATUS_NOT_FOUND = 404

let access: { token: string; expiresAt: number } | null = null

Deno.serve(async (req) => {
  if (callerRole(req) !== "service_role") {
    return Response.json(
      { error: "Database only" },
      { status: STATUS_FORBIDDEN },
    )
  }

  const { notification_id: id } = await req.json()
  if (typeof id !== "string") {
    return Response.json(
      { error: "notification_id required" },
      { status: STATUS_BAD_REQUEST },
    )
  }

  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"))

  // Setting pushed_at is the claim: a repeated call finds nothing left to send.
  const { data: notification, error } = await db
    .from("notifications")
    .update({ pushed_at: new Date().toISOString() })
    .eq("id", id)
    .is("pushed_at", null)
    .select("user_id, title, body, url")
    .maybeSingle()
  if (error) throw error
  if (!notification) return Response.json({ sent: 0 })

  const { data: devices, error: devicesError } = await db
    .from("push_tokens")
    .select("token, platform")
    .eq("user_id", notification.user_id)
  if (devicesError) throw devicesError

  const responses = await Promise.all(
    devices.map(({ token, platform }) =>
      send(fcmMessage(token, platform, notification)),
    ),
  )

  // 404: the app was uninstalled, the browser reset or the permission revoked.
  const gone = devices
    .filter((_, index) => responses[index].status === STATUS_NOT_FOUND)
    .map(({ token }) => token)
  if (gone.length) await db.from("push_tokens").delete().in("token", gone)

  for (const response of responses) {
    if (!response.ok && response.status !== STATUS_NOT_FOUND) {
      console.error("push failed", response.status, await response.text())
    }
  }

  return Response.json({
    sent: responses.filter((response) => response.ok).length,
  })
})

// Browsers get data only, for public/sw-push.js to show. The native apps get a
// notification the system shows by itself, even with the app closed.
function fcmMessage(
  token: string,
  platform: string,
  { title, body, url }: { title: string; body: string; url: string },
) {
  if (platform === "web") {
    return {
      token,
      data: { title, body, url },
      webpush: { headers: { Urgency: "high" } },
    }
  }
  return {
    token,
    notification: { title, body },
    data: { url },
    android: { priority: "high" },
  }
}

async function send(message: unknown) {
  const account: ServiceAccount = JSON.parse(env("FCM_SERVICE_ACCOUNT"))
  return fetch(
    `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await accessToken(account)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    },
  )
}

async function accessToken(account: ServiceAccount) {
  const now = Math.floor(Date.now() / MS_PER_SECOND)
  if (access && access.expiresAt - RENEW_MARGIN_S > now) return access.token

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: await signedJwt(account, now),
    }),
  })
  if (!res.ok)
    throw new Error(`Google OAuth ${res.status}: ${await res.text()}`)
  const { access_token, expires_in } = await res.json()
  access = { token: access_token, expiresAt: now + expires_in }
  return access_token
}

async function signedJwt(account: ServiceAccount, now: number) {
  const header = jwtPart({ alg: "RS256", typ: "JWT" })
  const claims = jwtPart({
    iss: account.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + TOKEN_LIFETIME_S,
  })
  const key = await crypto.subtle.importKey(
    "pkcs8",
    decodeBase64(
      account.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, ""),
    ),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  )
  return `${header}.${claims}.${encodeBase64Url(signature)}`
}

function jwtPart(value: unknown) {
  return encodeBase64Url(new TextEncoder().encode(JSON.stringify(value)))
}

// The gateway has already verified the token's signature; its role says whether
// the database sent it or a client holding the publishable key.
function callerRole(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  )
  try {
    const payload = decodeBase64Url(token.split(".")[1])
    return JSON.parse(new TextDecoder().decode(payload)).role
  } catch {
    return null
  }
}

function env(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not set`)
  return value
}
