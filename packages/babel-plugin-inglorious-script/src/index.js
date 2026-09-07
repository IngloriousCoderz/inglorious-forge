import { addNamed } from "@babel/helper-module-imports"

import { Config } from "./config.js"
import { injectHelpers } from "./helpers.js"
import {
  couldBeVector,
  isCertainlyScalar,
  isCertainlyVector,
} from "./static-check.js"

const V_MODULE = "@inglorious/utils/v.js"
const UNARY_MINUS = -1

export default function (babel) {
  const t = babel.types

  return {
    name: "inglorious-script",
    visitor: {
      Program: {
        enter() {
          this.vectorOperators = new Set()
          this.needsEnsureV = false
        },
        exit(path) {
          if (this.needsEnsureV) {
            const ensureVId = addNamed(path, "ensureV", V_MODULE)

            path.traverse({
              CallExpression(innerPath) {
                if (
                  t.isIdentifier(innerPath.node.callee, { name: "ensureV" })
                ) {
                  innerPath.node.callee = t.cloneNode(ensureVId)
                }
              },
            })
          }

          injectHelpers(t, path, this.vectorOperators)
        },
      },

      BinaryExpression(path) {
        const { operator, left, right } = path.node

        // Check if either operand could be a vector
        const leftCould = couldBeVector(left, path.scope)
        const rightCould = couldBeVector(right, path.scope)

        // If neither could be a vector, skip transformation
        if (!leftCould && !rightCould) return

        const config = Config[operator]
        if (!config) return

        // Perform static validation when we're certain about types
        const leftCertain = isCertainlyVector(left, path.scope)
        const rightCertain = isCertainlyVector(right, path.scope)
        const leftScalar = isCertainlyScalar(left, path.scope)
        const rightScalar = isCertainlyScalar(right, path.scope)

        // Static error checking for certain cases
        if (config.type === "vec_op_vec") {
          if ((leftCertain && rightScalar) || (leftScalar && rightCertain)) {
            throw path.buildCodeFrameError(config.error_scalar)
          }
        } else if (config.type === "vec_op_scalar") {
          if (leftCertain && rightCertain) {
            throw path.buildCodeFrameError(config.error_scalar)
          }
        } else if (config.type === "vec_op_scalar_commutative") {
          if (leftCertain && rightCertain) {
            throw path.buildCodeFrameError(config.error_vectors)
          }
        }

        // Transform the expression - runtime will handle uncertain cases
        this.vectorOperators.add(operator)
        const operationCall = t.callExpression(
          t.identifier(config.helperName),
          [left, right],
        )
        path.replaceWith(operationCall)
      },

      AssignmentExpression(path) {
        const { operator, left, right } = path.node

        // Skip if this assignment is part of a generated sequence
        if (path.node._skipTransform) {
          return
        }

        // Handle component assignments to potential vectors (e.g., vector[0] = value)
        if (operator === "=" && t.isMemberExpression(left) && left.computed) {
          const object = left.object
          if (couldBeVector(object, path.scope)) {
            // Create the original assignment (marked to skip further transformation)
            const originalAssignment = t.cloneNode(path.node)
            originalAssignment._skipTransform = true

            // Create the ensureV assignment (marked to skip transformation)
            const ensureVCall = t.assignmentExpression(
              "=",
              t.cloneNode(object),
              t.callExpression(t.identifier("ensureV"), [t.cloneNode(object)]),
            )
            ensureVCall._skipTransform = true

            // Create sequence expression
            const sequence = t.sequenceExpression([
              originalAssignment,
              ensureVCall,
            ])

            // Replace with the sequence and skip further processing
            path.replaceWith(sequence)
            path.skip()

            // Track that we need ensureV
            this.needsEnsureV = true
            return
          }
        }

        // Handle compound assignments to potential vectors (e.g., vector[0] += value)
        if (operator !== "=" && t.isMemberExpression(left) && left.computed) {
          const object = left.object
          if (couldBeVector(object, path.scope)) {
            // First, convert compound assignment to regular assignment
            const realOperator = operator.replace("=", "")
            const regularAssignment = t.assignmentExpression(
              "=",
              t.cloneNode(left),
              t.binaryExpression(realOperator, t.cloneNode(left), right),
            )
            regularAssignment._skipTransform = true

            // Create the ensureV assignment (marked to skip transformation)
            const ensureVCall = t.assignmentExpression(
              "=",
              t.cloneNode(object),
              t.callExpression(t.identifier("ensureV"), [t.cloneNode(object)]),
            )
            ensureVCall._skipTransform = true

            // Create sequence expression
            const sequence = t.sequenceExpression([
              regularAssignment,
              ensureVCall,
            ])

            // Replace with sequence and skip further processing
            path.replaceWith(sequence)
            path.skip()

            // Track that we need ensureV
            this.needsEnsureV = true
            return
          }
        }

        // Original vector operation logic for non-component assignments
        const leftCould = couldBeVector(left, path.scope)
        if (!leftCould) return

        const realOperator = operator.replace("=", "")
        const config = Config[realOperator]
        if (!config) return

        // Static validation for certain cases
        const leftCertain = isCertainlyVector(left, path.scope)
        const rightCertain = isCertainlyVector(right, path.scope)
        const rightScalar = isCertainlyScalar(right, path.scope)

        if (config.type === "vec_op_vec" && leftCertain && rightScalar) {
          throw path.buildCodeFrameError(config.error_scalar)
        }
        if (
          config.type === "vec_op_scalar_commutative" &&
          leftCertain &&
          rightCertain
        ) {
          throw path.buildCodeFrameError(config.error_vectors)
        }

        // Transform the assignment - let runtime handle validation
        this.vectorOperators.add(realOperator)
        path.replaceWith(
          t.assignmentExpression(
            "=",
            left,
            t.callExpression(t.identifier(config.helperName), [left, right]),
          ),
        )
      },

      UnaryExpression(path) {
        const { operator, argument } = path.node

        // Only handle unary minus on potential vectors
        if (operator !== "-" || !couldBeVector(argument, path.scope)) {
          return
        }

        const realOperator = "*"
        const config = Config[realOperator]
        if (!config) return

        this.vectorOperators.add(realOperator)
        path.replaceWith(
          t.callExpression(t.identifier(config.helperName), [
            argument,
            t.valueToNode(UNARY_MINUS),
          ]),
        )
      },

      CallExpression(path) {
        const { callee } = path.node

        if (t.isMemberExpression(callee) && !callee.computed) {
          const object = callee.object
          const methodName = callee.property.name

          const arrayMethods = [
            "map",
            "filter",
            "slice",
            "concat",
            "flat",
            "flatMap",
            "reduce",
            "reduceRight",
          ]

          if (
            arrayMethods.includes(methodName) &&
            couldBeVector(object, path.scope)
          ) {
            const ensureVCall = t.callExpression(t.identifier("ensureV"), [
              t.cloneNode(path.node),
            ])
            ensureVCall._skipTransform = true

            path.replaceWith(ensureVCall)
            path.skip()

            this.needsEnsureV = true
            return
          }
        }
      },
    },
  }
}
