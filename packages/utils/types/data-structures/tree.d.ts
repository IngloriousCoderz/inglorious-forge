/**
 * Represents a generic tree data structure.
 * Each node in the tree has a value and an optional array of child nodes.
 * @template T - The type of the value stored in the tree nodes. Defaults to `any`.
 */
export interface Tree<T = any> {
  /** The value of the current node. */
  value: T
  /** An optional array of child `Tree` nodes. */
  children?: readonly Tree<T>[]
}

/**
 * Traverses a tree breadth-first.
 */
export function bfs<T>(tree: Tree<T>): T[]

/**
 * Traverses a tree depth-first.
 */
export function dfs<T>(tree: Tree<T>): T[]
