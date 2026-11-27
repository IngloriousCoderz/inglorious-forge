import type { Middleware } from "@inglorious/store"

/** Handles `spawn` and `despawn` with entity pools, and adds them to the api. */
export function entityPoolMiddleware(): Middleware
