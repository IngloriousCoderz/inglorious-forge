import { addNamed } from "@babel/helper-module-imports"

const VECTORS_MODULE = "@inglorious/utils/vectors"
const V_MODULE = "@inglorious/utils/v.js"

import { Config } from "./config.js"

/**
 * Injects the necessary helper functions and imports into the program body.
 * This function is called at the end of the program traversal.
 * @param {import("@babel/core")} t The types defined in the Babel core object.
 * @param {import("@babel/traverse").NodePath<import("@babel/types").Program>} programPath The path to the Program node.
 * @param {Set<string>} operators A set of operators whose helpers have to be injected.
 */
export function injectHelpers(t, programPath, operators) {
  let hasVCalls = false

  programPath.traverse({
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, { name: "v" })) {
        hasVCalls = true
        path.stop()
      }
    },
  })

  if (hasVCalls) {
    const vId = addNamed(programPath, "v", V_MODULE)

    programPath.traverse({
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, { name: "v" })) {
          path.node.callee = t.cloneNode(vId)
        }
      },
    })
  }

  let isVectorId = null
  if (operators.size) {
    isVectorId = addNamed(programPath, "isVector", VECTORS_MODULE)
  }

  const helper = createHelper(t, isVectorId)

  const helperFunctions = Array.from(operators).map((operator) => {
    const config = Config[operator]
    if (config.type === "vec_op_mixed") {
      const vecOpVecId = addNamed(
        programPath,
        config.originalFunctionVec,
        config.moduleVec,
      )
      const vecOpScalarId = vecOpVecId
      const vecOpScalarReverseId = config.originalFunctionScalarReverse
        ? addNamed(
            programPath,
            config.originalFunctionScalarReverse,
            config.moduleScalarReverse,
          )
        : null
      return helper(operator, config, {
        vecOpVecId,
        vecOpScalarId,
        vecOpScalarReverseId,
      })
    }
    const importId = addNamed(
      programPath,
      config.originalFunction,
      config.module,
    )
    return helper(operator, config, { importId })
  })

  programPath.unshiftContainer("body", helperFunctions)
}

/**
 * Creates a factory function for generating vector operation helpers.
 * @param {import("@babel/core").types} t The Babel types object.
 * @param {import("@babel/types").Identifier | null} isVectorId The identifier for the `isVector` helper.
 * @returns {function} A function that generates the AST for a specific helper.
 */
function createHelper(t, isVectorId) {
  return (
    operator,
    { helperName, type, error_vectors, error_scalar },
    { importId, vecOpVecId, vecOpScalarId, vecOpScalarReverseId },
  ) => {
    const a = t.identifier("a")
    const b = t.identifier("b")

    const isAVector = t.callExpression(isVectorId, [a])
    const isBVector = t.callExpression(isVectorId, [b])
    const isAScalar = t.unaryExpression("!", isAVector)
    const isBScalar = t.unaryExpression("!", isBVector)

    const statements = []

    if (type === "vec_op_vec") {
      // For vec_op_vec operations (+ and -), both operands must be vectors
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBVector),
          t.returnStatement(t.callExpression(importId, [a, b])),
        ),
      )

      // If both are scalars, fall back to regular JavaScript operation
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAScalar, isBScalar),
          t.returnStatement(t.binaryExpression(operator, a, b)),
        ),
      )

      // If we get here, we have mixed vector/scalar types
      statements.push(
        t.throwStatement(
          t.newExpression(t.identifier("Error"), [
            t.stringLiteral(error_scalar),
          ]),
        ),
      )
    } else if (type === "vec_op_scalar") {
      // For vec_op_scalar operations (/, %, **), first operand must be vector, second must be scalar
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBScalar),
          t.returnStatement(t.callExpression(importId, [a, b])),
        ),
      )

      // Check for invalid combinations and throw appropriate errors
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBVector),
          t.throwStatement(
            t.newExpression(t.identifier("Error"), [
              t.stringLiteral(error_vectors),
            ]),
          ),
        ),
      )

      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAScalar, isBVector),
          t.throwStatement(
            t.newExpression(t.identifier("Error"), [
              t.stringLiteral(error_scalar),
            ]),
          ),
        ),
      )

      // If both are scalars, fall through to regular operation
      statements.push(t.returnStatement(t.binaryExpression(operator, a, b)))
    } else if (type === "vec_op_scalar_commutative") {
      // For commutative operations (*), we accept vec*scalar or scalar*vec
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBScalar),
          t.returnStatement(t.callExpression(importId, [a, b])),
        ),
      )

      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAScalar, isBVector),
          t.returnStatement(t.callExpression(importId, [b, a])),
        ),
      )

      // If both are vectors, throw error
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBVector),
          t.throwStatement(
            t.newExpression(t.identifier("Error"), [
              t.stringLiteral(error_vectors),
            ]),
          ),
        ),
      )

      // If both are scalars, fall through to regular operation
      statements.push(t.returnStatement(t.binaryExpression(operator, a, b)))
    } else if (type === "vec_op_mixed") {
      // For mixed operations (%, **), we accept vec-vec and vec-scalar
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBVector),
          t.returnStatement(t.callExpression(vecOpVecId, [a, b])),
        ),
      )

      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAVector, isBScalar),
          t.returnStatement(t.callExpression(vecOpScalarId, [a, b])),
        ),
      )

      if (operator === "*") {
        // Commutative scalar multiplication
        statements.push(
          t.ifStatement(
            t.logicalExpression("&&", isAScalar, isBVector),
            t.returnStatement(t.callExpression(vecOpScalarId, [b, a])),
          ),
        )
      } else if (
        (operator === "**" || operator === "%" || operator === "/") &&
        vecOpScalarReverseId
      ) {
        statements.push(
          t.ifStatement(
            t.logicalExpression("&&", isAScalar, isBVector),
            t.returnStatement(t.callExpression(vecOpScalarReverseId, [a, b])),
          ),
        )
      }
      // Throw error for scalar-vec
      statements.push(
        t.ifStatement(
          t.logicalExpression("&&", isAScalar, isBVector),
          t.throwStatement(
            t.newExpression(t.identifier("Error"), [
              t.stringLiteral(error_scalar),
            ]),
          ),
        ),
      )

      // If both are scalars, fall through to regular operation
      statements.push(t.returnStatement(t.binaryExpression(operator, a, b)))
    }

    return t.functionDeclaration(
      t.identifier(helperName),
      [a, b],
      t.blockStatement(statements),
    )
  }
}
