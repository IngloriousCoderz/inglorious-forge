import type { Vector } from "@inglorious/utils/math/vector"

declare global {
  function v(...coords: number[]): Vector
}

export {}
