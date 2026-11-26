import type { Api, TemplateResult } from "@inglorious/web"

export interface Face {
  /** name of the svg */
  image:
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F"
    | "G"
    | "H"
    | "I"
    | "J"
    | "K"
    | "L"
    | "M"
    | "N"
    | "O"
    | "P"
    | "Q"
    | "R"
    | "S"
    | "T"
    | "U"
    | "V"
    | "W"
    | "X"
    | "Y"
    | "Z"
  /** whether this face should be flipped horizontally */
  reverse?: boolean
  /** whether the small eye asset should be rendered */
  eye?: boolean
}

export interface LogoEntity {
  id?: string
  type: string
  size: number
  faces: [Face, Face]
  /** pointer offset from the center in pixels, set while interactive */
  position?: [number, number]
  /** horizontal and vertical rotation in degrees, default [-45, -40] */
  rotation?: [number, number]
  /** skew of the faces in degrees, default 12 */
  skew?: number
  isInteractive?: boolean
  isScrollPrevented?: boolean
}

export type LogoType = {
  render(entity: LogoEntity, api: Api): TemplateResult
  create(entity: LogoEntity, payload: unknown, api: Api): void
  coordsChange(entity: LogoEntity, payload: { x: number; y: number }): void
  destroy(entity: LogoEntity, payload: unknown, api: Api): void
}

export declare function startInteraction(entity: LogoEntity, api: Api): void
export declare function stopInteraction(entity?: LogoEntity): void

export declare const Logo: LogoType
