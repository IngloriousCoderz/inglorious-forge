export function filterClick(entity, id) {
  entity.activeFilter = id
}

export function clearClick(entity) {
  entity.activeFilter = "all"
}
