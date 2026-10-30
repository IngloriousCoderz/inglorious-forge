/**
 * Checks if a Babel AST node could potentially be a vector at runtime.
 * This is a permissive check - when in doubt, it returns true to allow
 * transformation and let runtime checks handle validation.
 */
export function couldBeVector(node, scope) {
  if (!node) {
    return false
  }

  if (
    node.type === "CallExpression" &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name === "v"
  ) {
    return true
  }

  if (
    node.type === "CallExpression" &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name.startsWith("__")
  ) {
    return true
  }

  if (node.type === "CallExpression") {
    return true
  }

  if (node.type === "MemberExpression") {
    return true
  }

  if (node.type === "Identifier") {
    const binding = scope.getBinding(node.name)
    if (!binding) {
      return false
    }

    const bindingNode = binding.path.node

    if (bindingNode.type === "ImportSpecifier") {
      return true
    }

    if (bindingNode.init) {
      return couldBeVector(bindingNode.init, scope)
    }
  }

  if (node.type === "BinaryExpression") {
    const { operator, left, right } = node
    const leftCould = couldBeVector(left, scope)
    const rightCould = couldBeVector(right, scope)

    if (operator === "+" || operator === "-") {
      return leftCould || rightCould
    }

    if (operator === "*") {
      return leftCould || rightCould
    }

    if (["/", "%", "**"].includes(operator)) {
      return leftCould
    }
  }

  if (node.type === "UnaryExpression" && node.operator === "-") {
    return couldBeVector(node.argument, scope)
  }

  if (
    node.type === "NumericLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "BooleanLiteral"
  ) {
    return false
  }

  return false
}

/**
 * Checks if we're certain that a node is a vector (for static error checking).
 * This is more conservative - only returns true when we're 100% sure.
 */
export function isCertainlyVector(node, scope) {
  if (!node) {
    return false
  }

  if (
    node.type === "CallExpression" &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name === "v"
  ) {
    return true
  }

  if (
    node.type === "CallExpression" &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name.startsWith("__")
  ) {
    return true
  }

  if (node.type === "Identifier") {
    const binding = scope.getBinding(node.name)
    if (!binding) {
      return false
    }

    const bindingNode = binding.path.node
    if (bindingNode.init) {
      return isCertainlyVector(bindingNode.init, scope)
    }
  }

  if (node.type === "BinaryExpression") {
    const { operator, left, right } = node
    const leftCertain = isCertainlyVector(left, scope)
    const rightCertain = isCertainlyVector(right, scope)

    if (operator === "+" || operator === "-") {
      return leftCertain && rightCertain
    }

    if (operator === "*") {
      return (
        (leftCertain && isCertainlyScalar(right, scope)) ||
        (isCertainlyScalar(left, scope) && rightCertain)
      )
    }

    if (["/", "%", "**"].includes(operator)) {
      return leftCertain && isCertainlyScalar(right, scope)
    }
  }

  if (node.type === "UnaryExpression" && node.operator === "-") {
    return isCertainlyVector(node.argument, scope)
  }

  return false
}

/**
 * Checks if we're certain that a node is a scalar (for static error checking).
 */
export function isCertainlyScalar(node, scope) {
  if (!node) {
    return false
  }

  if (
    node.type === "NumericLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "BooleanLiteral"
  ) {
    return true
  }

  if (node.type === "Identifier") {
    const binding = scope.getBinding(node.name)
    if (!binding) {
      return false
    }

    const bindingNode = binding.path.node
    if (bindingNode.init) {
      return isCertainlyScalar(bindingNode.init, scope)
    }
  }

  if (node.type === "BinaryExpression") {
    const { left, right } = node
    return isCertainlyScalar(left, scope) && isCertainlyScalar(right, scope)
  }

  if (node.type === "UnaryExpression") {
    return isCertainlyScalar(node.argument, scope)
  }

  return false
}
