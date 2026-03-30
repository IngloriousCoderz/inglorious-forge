/**
 * Create a Babel template element node.
 *
 * @param {string} raw - The raw template text.
 * @param {boolean} [tail=false] - Whether this is the final template chunk.
 * @returns {import("@babel/types").TemplateElement} The template element node.
 */
export function tpl(raw, tail = false) {
  return {
    type: "TemplateElement",
    value: { raw, cooked: raw },
    tail,
  }
}

/**
 * Create a Babel import specifier node for a named import.
 *
 * @param {string} name - The imported binding name.
 * @returns {import("@babel/types").ImportSpecifier} The import specifier node.
 */
export function createImportSpecifier(name) {
  return {
    type: "ImportSpecifier",
    imported: { type: "Identifier", name },
    local: { type: "Identifier", name },
  }
}

/**
 * Convert kebab-case or PascalCase to camelCase.
 *
 * @param {string} input - The string to convert.
 * @returns {string} The camelCased string.
 */
export function toCamelCase(input) {
  const [firstChar, ...rest] = input.replace(/-([a-z0-9])/gi, (_, c) =>
    c.toUpperCase(),
  )

  return [firstChar.toLowerCase(), ...rest].join("")
}

/**
 * Check whether a node is JSX that should be treated as rendered content.
 *
 * @param {object} node - The node to inspect.
 * @returns {boolean} True when the node is JSX or already transformed html().
 */
export function isJsx(node) {
  return (
    node.type === "JSXElement" ||
    node.type === "JSXFragment" ||
    (node.type === "CallExpression" && node.callee.name === "html")
  )
}
