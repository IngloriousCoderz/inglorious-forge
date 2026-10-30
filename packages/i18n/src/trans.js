// Tags in a translation are placeholders for components, not HTML: only the
// names the caller passes in `components` are replaced, and anything else
// stays visible text. Values are interpolated into the text between tags
// after parsing, so a value can never turn into markup.
const TAG = /<(\/?)([A-Za-z0-9_-]+)\s*(\/?)>/g

/**
 * Turns a translated string into parts for a template: strings, and what the
 * components return for the tags they own.
 *
 * @param {string} raw - The translation, with `{{placeholders}}` still in it.
 * @param {Record<string, (children: unknown[]) => unknown>} components
 * @param {(text: string) => string} interpolate - Fills the placeholders of a text piece.
 * @returns {unknown[]}
 */
export function parseTrans(raw, components, interpolate) {
  const root = { children: [], parent: null }
  let current = root
  const addText = (text) => {
    if (text) current.children.push(interpolate(text))
  }

  let last = 0
  for (const match of raw.matchAll(TAG)) {
    const [source, closing, name, selfClosing] = match
    addText(raw.slice(last, match.index))
    last = match.index + source.length

    const component = components[name]
    if (!component) {
      current.children.push(source)
    } else if (selfClosing) {
      current.children.push(component([]))
    } else if (!closing) {
      current = { name, source, children: [], parent: current }
    } else if (current.name === name) {
      const node = current
      current = node.parent
      current.children.push(component(node.children))
    } else {
      current.children.push(source)
    }
  }
  addText(raw.slice(last))

  while (current !== root) {
    const node = current
    current = node.parent
    current.children.push(node.source, ...node.children)
  }

  return root.children
}
