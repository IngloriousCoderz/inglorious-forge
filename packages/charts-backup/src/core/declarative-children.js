const DECLARATIVE_CHILD_NAMES = [
  "XAxis",
  "YAxis",
  "Line",
  "Area",
  "Bar",
  "Pie",
  "CartesianGrid",
  "Tooltip",
  "Brush",
  "Dots",
  "Legend",
]

export function createDeclarativeChildren() {
  return Object.fromEntries(
    DECLARATIVE_CHILD_NAMES.map((name) => [name, buildDeclarativeChild(name)]),
  )
}

function buildDeclarativeChild(typeName) {
  return (config = {}) => ({ type: typeName, config })
}
