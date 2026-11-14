import { handleRequest } from "@inglorious/store/async"

import { isNative } from "../../native/index.js"

const UNSUPPORTED = "unsupported"
const FAILED = "failed"
// Capacitor's Share rejects with this when the person closes the sheet.
const NATIVE_CANCEL = /cancel/i

/**
 * The type behind a share button. `share` hands a title, text, link or file
 * to whatever the device does best, and the entity says what happened:
 *
 * - in a native app, the system's share sheet, through `Share` from
 *   `@capacitor/share` when given as `plugin`;
 * - in a browser, a file (a `url` with a `fileName`) downloads, since a
 *   browser has nowhere better to put it;
 * - otherwise the browser's share sheet where there is one (Web Share API),
 *   else the link is copied.
 *
 * `result` is `"shared"`, `"downloaded"`, `"copied"` or `"cancelled"`: closing
 * the sheet is not an error. `status` and `error` (`"unsupported"` or
 * `"failed"`) are those of `handleRequest`. `canShare` says whether a link can
 * be shared at all, to hide the button otherwise; a file can always download.
 *
 * @param {{ plugin?: { share(options: object): Promise<unknown> } }} [config]
 *
 * @example
 * import { Share } from "@capacitor/share"
 * const types = { Share: createShare({ plugin: Share }) }
 * api.notify("#share:share", { title: "My job", url })
 */
export function createShare({ plugin } = {}) {
  return {
    create(entity) {
      entity.status ??= "idle"
      entity.error ??= null
      entity.result ??= null
      entity.canShare = canShare(plugin)
    },

    ...handleRequest(
      "share",
      {
        start(entity) {
          entity.result = null
        },
        run: (content) => share(content, plugin),
        success(entity, result) {
          entity.result = result
        },
      },
      {
        toError: (error) =>
          error?.message === UNSUPPORTED ? UNSUPPORTED : FAILED,
      },
    ),
  }
}

async function share({ title, text, url, fileName } = {}, plugin) {
  if (plugin && isNative()) {
    try {
      await plugin.share({ title, text, url, dialogTitle: title })
      return "shared"
    } catch (error) {
      if (NATIVE_CANCEL.test(error?.message ?? "")) return "cancelled"
      throw error
    }
  }

  if (url && fileName) {
    download(url, fileName)
    return "downloaded"
  }

  const navigator = globalThis.navigator
  if (navigator?.share) {
    try {
      await navigator.share({ title, text, url })
      return "shared"
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled"
      throw error
    }
  }

  if (url && navigator?.clipboard) {
    await navigator.clipboard.writeText(url)
    return "copied"
  }

  throw new Error(UNSUPPORTED)
}

function canShare(plugin) {
  if (plugin && isNative()) return true
  const navigator = globalThis.navigator
  return Boolean(navigator?.share || navigator?.clipboard)
}

function download(url, fileName) {
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
}
