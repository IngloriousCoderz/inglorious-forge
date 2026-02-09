export function create(entity) {
  entity.activeFilter = "all"
}

export function filterClick(entity, id) {
  entity.activeFilter = id
}

export function clearClick(entity) {
  entity.activeFilter = "all"
}
