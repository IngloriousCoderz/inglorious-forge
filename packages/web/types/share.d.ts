import type { AsyncEvents } from "@inglorious/store/async"

/** What `createShare` needs of `Share` from `@capacitor/share`. */
export interface SharePlugin {
  share(options: {
    title?: string
    text?: string
    url?: string
    dialogTitle?: string
  }): Promise<unknown>
}

/** What to share: a link, a text, or a file to download in a browser. */
export interface ShareContent {
  title?: string
  text?: string
  url?: string
  /** Makes `url` a file: a browser downloads it under this name. */
  fileName?: string
}

export interface ShareEntity {
  id?: string
  type: string
  status: "idle" | "loading" | "success" | "error"
  error: "unsupported" | "failed" | null
  result: "shared" | "downloaded" | "copied" | "cancelled" | null
  /** A link can be shared, by sheet or by copying it. */
  canShare: boolean
}

export type ShareType = {
  create(entity: ShareEntity): void
} & AsyncEvents<"share", ShareEntity, ShareContent, ShareEntity["result"]>

/**
 * The type behind a share button: the system's sheet in a native app, a
 * download for files in a browser, else the browser's sheet, else a copy.
 */
export declare function createShare(config?: {
  plugin?: SharePlugin
}): ShareType
