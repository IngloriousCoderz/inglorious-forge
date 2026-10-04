/**
 * @typedef {import("../../types/algorithms/path-finding").Node} Node
 * @typedef {import("../../types/algorithms/path-finding").Graph} Graph
 * @typedef {import("../../types/math/vectors").Vector2} Vector2
 */

import { contains, push, remove, root } from "../data-structures/heap.js"
import { abs, magnitude, subtract } from "../math/vectors.js"

const NO_COST = 0

/**
 * Calculates the cost of a path using Dijkstra's algorithm.
 * In this simplified form the cost is simply 0.
 *
 * @returns {number} - The cost of the path (which is 0).
 */
export const dijkstra = () => NO_COST

/**
 * Calculates the Euclidean distance between two nodes.
 *
 * @param {Node} a - The first node.
 * @param {Node} b - The second node.
 * @returns {number} - The Euclidean distance between the two nodes.
 */
export const eucledianDistance = (a, b) =>
  magnitude(subtract(a.position, b.position))

/**
 * Calculates the Manhattan distance between two nodes.
 *
 * @param {Node} a - The first node.
 * @param {Node} b - The second node.
 * @returns {Vector2} The component-wise Manhattan distance between the two nodes.
 */
export const manhattanDistance = (a, b) => abs(subtract(a.position, b.position))

/**
 * Compares the cost of two nodes.
 *
 * @param {Node} a - The first node.
 * @param {Node} b - The second node.
 * @returns {number} - The difference in cost between the two nodes.
 */
const compareCost = (a, b) => b.cost - a.cost

/**
 * Compares the total cost of two nodes.
 *
 * @param {Node} a - The first node.
 * @param {Node} b - The second node.
 * @returns {number} - The difference in total cost between the two nodes.
 */
const compareTotalCost = (a, b) => b.totalCost - a.totalCost

/**
 * Finds the shortest path in a graph from a start node to an end node using a heuristic.
 *
 * @param {Graph} graph - The graph containing nodes and arcs.
 * @param {string} start - The ID of the start node.
 * @param {string} end - The ID of the end node.
 * @param {(a: Node, b: Node) => number} [heuristic=eucledianDistance] - The heuristic function to estimate the cost.
 * @returns {string[]|undefined} - The node IDs representing the shortest path, or `undefined` if no path exists.
 */
export function findPath(graph, start, end, heuristic = eucledianDistance) {
  const { nodes, arcs } = adaptGraph(graph)
  const findNode = createFindNode(nodes)

  const startNode = findNode(start)
  const endNode = findNode(end)
  let discoveredNodes = [startNode]
  let evaluatedNodes = []
  let path = []

  while (discoveredNodes.length) {
    let current = root(discoveredNodes, compareTotalCost)

    if (current.id === end) {
      while (current != null) {
        path = [current.id, ...path]
        current = current.previous
      }

      return path
    }

    discoveredNodes = remove(discoveredNodes, current)
    evaluatedNodes = push(evaluatedNodes, current)

    const outgoingArcs = arcs.filter(({ from }) => from === current.id)
    const destinations = outgoingArcs.map(({ to }) => findNode(to))

    for (const destination of destinations) {
      const totalCost =
        current.cost +
        destination.cost +
        heuristic(current, destination) +
        outgoingArcs.find(({ to }) => to === destination.id)?.cost

      let isNewPathFound = false
      if (contains(discoveredNodes, destination)) {
        if (totalCost < destination.cost) {
          destination.cost = totalCost
          isNewPathFound = true
        }
      } else {
        destination.cost = totalCost
        isNewPathFound = true
        discoveredNodes = push(discoveredNodes, destination, compareCost)
      }

      if (isNewPathFound) {
        destination.totalCost =
          destination.cost + heuristic(destination, endNode)
        destination.previous = current
      }
    }
  }
}

/**
 * Adapts a graph to ensure all nodes and arcs have a cost property.
 *
 * @param {Graph} graph - The graph to adapt.
 * @returns {Graph} - The adapted graph with cost properties added.
 */
function adaptGraph(graph) {
  return {
    ...graph,
    nodes: Array.isArray(graph.nodes)
      ? graph.nodes.map((node) => ({ ...node, cost: node.cost ?? NO_COST }))
      : Object.entries(graph.nodes).map(([key, value]) => ({
          id: key,
          position: value,
          cost: 0,
        })),
    arcs: graph.arcs.map((arc) => ({ ...arc, cost: arc.cost ?? NO_COST })),
  }
}

/**
 * Creates a function that finds a node by its ID.
 *
 * @param {Node[]} nodes - The array of nodes.
 * @returns {(id: string) => Node} - A function that finds a node by its ID.
 */
function createFindNode(nodes) {
  return (id) => nodes.find((node) => node.id === id)
}
