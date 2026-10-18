// Import statements in the order eslint-plugin-simple-import-sort gives them,
// so a generated project passes `eslint` as it is: side-effect imports first,
// in the order given, then packages, then relative modules, a blank line
// between groups.

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true })

/**
 * @param {string[]} lines - One import statement each.
 * @returns {string}
 */
export function importBlock(lines) {
  const sideEffects = []
  const packages = []
  const relative = []

  for (const line of lines) {
    const source = sourceOf(line)
    if (!line.includes(" from ")) sideEffects.push(line)
    else if (source.startsWith(".")) relative.push(line)
    else packages.push(line)
  }

  return [sideEffects, sortImports(packages), sortImports(relative)]
    .filter((group) => group.length)
    .map((group) => group.join("\n"))
    .join("\n\n")
}

function sortImports(lines) {
  return lines
    .map((line) => ({ line, source: sourceOf(line) }))
    .sort(
      (a, b) =>
        compare(normalize(a.source), normalize(b.source)) ||
        compare(a.source, b.source) ||
        // Type imports before regular ones from the same module.
        Number(b.line.startsWith("import type")) -
          Number(a.line.startsWith("import type")),
    )
    .map(({ line }) => line)
}

// The plugin's own normalization: by directory level, `.` and `/` before any
// other punctuation.
function normalize(source) {
  return source
    .replace(/^[./]*\.$/, "$&/")
    .replace(/^[./]*\/$/, "$&,")
    .replace(
      /[./_-]/g,
      (char) => ({ ".": "_", "/": "-", _: ".", "-": "/" })[char],
    )
}

function compare(a, b) {
  return collator.compare(a, b) || Number(a > b) - Number(a < b)
}

// The module an import statement imports from.
function sourceOf(line) {
  const [, source] = line.match(/"([^"]+)"/)
  return source
}
