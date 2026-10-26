/**
 * @typedef {import("../../types/pwa.js").PwaUpdateEntity} PwaUpdateEntity
 */

import { applyPwaUpdate } from "./update.js"

export function create(entity) {
  entity.isUpdateReady ??= false
}

export function pwaUpdateApply() {
  applyPwaUpdate()
}

export function pwaUpdateReady(entity) {
  entity.isUpdateReady = true
}
