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
