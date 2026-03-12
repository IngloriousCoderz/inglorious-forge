export function itemToggle(entity, payload) {
  if (!payload?.path?.length) return

  entity.items = toggleItemByPath(entity.items, payload.path)
}

function toggleItemByPath(items, path) {
  if (!Array.isArray(items) || path.length === 0) return items

  const [index, ...rest] = path
  return items.map((item, itemIndex) => {
    if (itemIndex !== index || !item || typeof item !== "object") return item

    if (rest.length === 0) {
      const isExpanded = !!item.isExpanded
      return { ...item, isExpanded: !isExpanded }
    }

    const children = Array.isArray(item.children)
      ? toggleItemByPath(item.children, rest)
      : item.children

    return { ...item, children }
  })
}
