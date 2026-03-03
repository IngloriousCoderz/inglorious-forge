import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"
import { dataGrid as renderers } from "./template.js"

export const dataGrid = {
  ...handlers,
  ...renderers,
  render(entity, api) {
    const id = entity.id
    const props = {
      ...entity,
      onMount: (el) => api.notify(`#${id}:mount`, el),
      onSortChange: (columnId) => api.notify(`#${id}:sortChange`, columnId),
      onFilterChange: (payload) => api.notify(`#${id}:filterChange`, payload),
      onSearchChange: (value) => api.notify(`#${id}:searchChange`, value),
      onRowToggle: (rowId) => api.notify(`#${id}:rowToggle`, rowId),
      onPageChange: (page) => api.notify(`#${id}:pageChange`, page),
      onPageNext: () => api.notify(`#${id}:pageNext`),
      onPagePrev: () => api.notify(`#${id}:pagePrev`),
      onPageSizeChange: (pageSize) =>
        api.notify(`#${id}:pageSizeChange`, pageSize),
    }

    return renderers.render(props)
  },
}

export const {
  getPaginationInfo,
  getRows,
  isSomeSelected,
  isAllSelected,
  getSortDirection,
  getTotalRows,
} = helpers
