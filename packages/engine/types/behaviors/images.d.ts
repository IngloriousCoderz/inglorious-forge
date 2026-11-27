import type { BaseEntity } from "@inglorious/store"

/** An image to load, by id. */
export interface ImageSource {
  url: string
}

export interface ImagesEntity extends BaseEntity {
  images: Record<string, ImageSource>
}

/** A loaded image, with the id it was loaded under. */
export type LoadedImage = HTMLImageElement & { id: string }

/** Loads images up front with `init`, or on demand with `load`, and hands them out by id. */
export function images(): {
  init: (entity: ImagesEntity) => Promise<void>
  load: (id: string, src: string) => Promise<LoadedImage>
  get: (id: string) => LoadedImage | undefined
  stop: () => void
}
