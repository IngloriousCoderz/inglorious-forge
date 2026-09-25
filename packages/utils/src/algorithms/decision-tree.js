/**
 * @typedef {import("../../types/algorithms/decision-tree").Conditions} Conditions
 * @typedef {import("../../types/algorithms/decision-tree").Outcome} Outcome
 * @typedef {import("../../types/algorithms/decision-tree").DecisionTree} DecisionTree
 */

/**
 * Traverses a decision tree recursively based on the provided conditions and returns the resulting node.
 *
 * @param {DecisionTree} tree - The decision tree to traverse. Each node contains:
 *   - `test` {Function}: A function that evaluates the conditions and determines the next branch.
 *   - Branches keyed by the possible outcomes of the `test` function.
 * @param {Conditions} conditions - The conditions object passed to the `test` function at each node.
 * @returns {Outcome | DecisionTree} - The resulting outcome or decision tree itself after traversing the decision tree.
 */
export function decide(tree, conditions) {
  if (!tree.test) {
    return tree
  }

  const value = tree.test(conditions)

  return tree[value] && decide(tree[value](conditions), conditions)
}
