/** @typedef {import('../../types/data-structures/tree').Tree} Tree */

/**
 * Performs a breadth-first search (BFS) traversal on a tree structure.
 * @param {Tree} tree - The root node of the tree.
 * @returns {Array} An array of values in BFS order.
 */
export function bfs(tree) {
  const result = []
  const queue = [tree]

  while (queue.length) {
    const node = queue.shift()
    result.push(node.value)
    if (node.children) {
      queue.push(...node.children)
    }
  }

  return result
}

/**
 * Performs a depth-first search (DFS) traversal on a tree structure.
 * @param {Tree} tree - The root node of the tree.
 * @returns {Array} An array of values in DFS order.
 */
export function dfs(tree) {
  const result = [tree.value]

  if (tree.children) {
    result.push(...tree.children.flatMap(dfs))
  }

  return result
}
