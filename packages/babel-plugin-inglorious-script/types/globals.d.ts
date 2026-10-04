import type { Vector } from "@inglorious/utils/vectors"

declare global {
  function v(...coords: number[]): Vector
}

export {}
