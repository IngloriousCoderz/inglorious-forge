/**
 * Represents the input conditions evaluated by a decision tree.
 */
export type Conditions = unknown

/**
 * Represents the value returned by a decision tree node's test function.
 */
export type Outcome = string | boolean

/**
 * Represents a node in a decision tree.
 */
export interface DecisionTree<C = Conditions> {
  /** Evaluates conditions and returns the key of the branch to follow. */
  test?: (conditions: C) => Outcome
  /** Resolves the branch associated with a test outcome. */
  [outcome: string]: ((conditions: C) => Outcome | DecisionTree<C>) | undefined
}

/**
 * Traverses a decision tree based on the provided conditions.
 */
export function decide<C>(
  tree: DecisionTree<C>,
  conditions: NoInfer<C>,
): Outcome | DecisionTree<C> | undefined
