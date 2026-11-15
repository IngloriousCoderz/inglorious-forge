export function create(entity) {
  entity.activeFilter = "all"
}

export function filterChange(entity, id) {
  entity.activeFilter = id
}

export function completedClear(entity) {
  entity.activeFilter = "all"
}
