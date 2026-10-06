import type { Vector } from "@inglorious/utils/vectors.js"

declare global {
  function v(...coords: number[]): Vector
}

export {}
