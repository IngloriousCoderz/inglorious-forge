import type { Vector } from "@inglorious/utils/vector.js"

declare global {
  function v(...coords: number[]): Vector
}

export {}
