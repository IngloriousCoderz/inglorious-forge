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
        Number(b.line.startsWith("import type")) -
          Number(a.line.startsWith("import type")),
    )
    .map(({ line }) => line)
}

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

function sourceOf(line) {
  const [, source] = line.match(/"([^"]+)"/)
  return source
}
