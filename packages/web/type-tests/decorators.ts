import {
  type BaseEntity,
  createStore,
  type EntitiesState,
} from "@inglorious/store"

import { type Api, html } from "../types"
import { withDebounce } from "../types/decorators/with-debounce"
import { withErrorBoundary } from "../types/decorators/with-error-boundary"
import { withThrottle } from "../types/decorators/with-throttle"

interface SearchEntity extends BaseEntity {
  type: "Search"
  query: string
}

interface AppState extends EntitiesState<SearchEntity> {
  search: SearchEntity
}

type AppApi = Api<SearchEntity, AppState>

type SearchType = {
  queryChange: (entity: SearchEntity, query: string) => void
  render: (entity: SearchEntity, api: AppApi) => ReturnType<typeof html>
}

const Search: SearchType = {
  queryChange(entity, query) {
    entity.query = query
  },
  render(entity) {
    return html`<input .value=${entity.query} />`
  },
}

const debounced = withDebounce(300, ["queryChange"])(Search)
debounced.queryChange({ type: "Search", query: "" }, "a")
debounced.queryChangeDebounced({ type: "Search", query: "" }, "a")
// @ts-expect-error: the wrapped handler keeps its payload
debounced.queryChange({ type: "Search", query: "" }, 1)
// @ts-expect-error: only the named handlers are wrapped
debounced.renderDebounced

const throttled = withThrottle({ queryChange: 100 }, undefined, {
  hasTrailing: true,
})(Search)
throttled.queryChangeThrottled({ type: "Search", query: "" }, "a")
// @ts-expect-error: a delay is a number of milliseconds
withThrottle({ queryChange: "100" })

const guarded = withErrorBoundary<SearchEntity, AppApi>(
  (error, entity) =>
    html`<p>
      ${entity.query}: ${error instanceof Error ? error.message : ""}
    </p>`,
)(Search)
guarded.render({ type: "Search", query: "", id: "search" }, {} as AppApi)

export const store = createStore<SearchEntity, AppState>({
  types: {
    Search: [
      Search,
      withDebounce(300, ["queryChange"]),
      withThrottle({ queryChange: 100 }),
      withErrorBoundary(),
    ],
  },
  entities: { search: { type: "Search", query: "" } },
})
