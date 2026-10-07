import type { Vector2 } from "../math/vector"

/**
 * A map where keys are node identifiers and values are their [x, y] coordinates.
 */
export interface NodeMap {
  [id: string]: [x: number, y: number]
}

/**
 * Represents a node in a graph.
 */
export interface Node {
  /** A unique identifier for the node. */
  id: string
  /** The [x, y] coordinates of the node. */
  position: [x: number, y: number]
  /** An optional cost associated with traversing to this node. */
  cost?: number
}

/**
 * Represents a directed edge between two nodes in a graph.
 */
export interface Arc {
  /** The ID of the starting node. */
  from: string
  /** The ID of the ending node. */
  to: string
  /** An optional cost associated with traversing this arc. */
  cost?: number
}

/**
 * Represents a graph structure consisting of nodes and arcs.
 */
export interface Graph {
  /** The graph nodes, as either an array or a map for efficient lookups. */
  nodes: NodeMap | Node[]
  /** The arcs connecting the nodes. */
  arcs: Arc[]
}

export type Heuristic = (a: Node, b: Node) => number

/**
 * Calculates the cost of a path using Dijkstra's algorithm.
 */
export function dijkstra(): number

/**
 * Calculates the Euclidean distance between two nodes.
 */
export function eucledianDistance(a: Node, b: Node): number

/**
 * Calculates the Manhattan distance between two nodes.
 */
export function manhattanDistance(a: Node, b: Node): Vector2

/**
 * Finds the shortest path between two nodes in a graph.
 */
export function findPath(
  graph: Graph,
  start: string,
  end: string,
  heuristic?: Heuristic,
): string[] | undefined
