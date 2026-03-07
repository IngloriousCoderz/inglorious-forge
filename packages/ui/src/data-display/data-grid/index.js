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
      onSortChange: (columnId) => api.notify(`#${id}:sortChange`, columnId),
      onFilterChange: (payload) => api.notify(`#${id}:filterChange`, payload),
      onSearchChange: (value) => api.notify(`#${id}:searchChange`, value),
      onColumnResizeStart: (payload) => startColumnResize(api, id, payload),
      onRowClick: (payload) => api.notify(`#${id}:rowClick`, payload),
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

const MIN_COLUMN_WIDTH = 72

function startColumnResize(api, id, { columnId, event, width }) {
  event.preventDefault()
  event.stopPropagation()

  const startX = event.clientX
  const startWidth = Math.max(MIN_COLUMN_WIDTH, Math.round(width))

  const handleMove = (moveEvent) => {
    api.notify(`#${id}:columnResize`, {
      columnId,
      width: startWidth + moveEvent.clientX - startX,
    })
  }

  const handleEnd = () => {
    window.removeEventListener("pointermove", handleMove)
    window.removeEventListener("pointerup", handleEnd)
  }

  window.addEventListener("pointermove", handleMove)
  window.addEventListener("pointerup", handleEnd, { once: true })
}
