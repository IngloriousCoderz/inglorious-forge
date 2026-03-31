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
  x: number
  y: number
  faces: [Face, Face]
  isInteractive?: boolean
  isScrollPrevented?: boolean
}

export interface LogoType {
  render(entity: LogoEntity, api: Api): TemplateResult
  create(entity: LogoEntity, payload: unknown, api: Api): void
  coordsChange(entity: LogoEntity, payload: { x: number; y: number }): void
  destroy(entity: LogoEntity, payload: unknown, api: Api): void
}

export declare const Logo: LogoType
