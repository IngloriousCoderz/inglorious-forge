import {
  type Api,
  type BaseEntity,
  type EntitiesState,
  type EntityType,
} from "../types"
import { type AsyncEvents, handleAsync } from "../types/behaviors/async"
import { optimistic } from "../types/behaviors/optimistic"
import { trigger } from "../types/test"

interface Todo {
  id: number
  title: string
}

interface TodoListEntity extends BaseEntity {
  type: "TodoList"
  todos: Todo[]
  isLoading?: boolean
  error?: string
}

interface UserEntity extends BaseEntity {
  type: "User"
  name: string
}

type AppEntity = TodoListEntity | UserEntity

interface AppState extends EntitiesState<AppEntity> {
  todoList: TodoListEntity
  user: UserEntity
}

type AppApi = Api<AppEntity, AppState>

declare function fetchTodos(userId: string): Promise<Todo[]>

export const TodoList = {
  ...handleAsync("load", {
    start(entity) {
      entity.isLoading = true
    },
    run: (userId: string) => fetchTodos(userId),
    success(entity, todos, api) {
      entity.todos = todos.map((todo) => ({
        ...todo,
        title: `${todo.title} (${api.getEntity("user")?.name})`,
      }))
    },
    error(entity, error) {
      entity.error = error.message
    },
    finally(entity) {
      entity.isLoading = false
    },
  }),
} satisfies EntityType<TodoListEntity, AppApi>

declare const todoList: TodoListEntity & { id: string }
declare const api: AppApi
TodoList.load(todoList, "user-1", api)
TodoList.loadStart?.(todoList, "user-1", api)
export const running: Promise<void> = TodoList.loadRun(todoList, "user-1", api)
TodoList.loadSuccess(todoList, [{ id: 1, title: "a" }], api)
TodoList.loadError(todoList, new Error("x"), api)
TodoList.loadFinally(todoList, undefined, api)

export const annotated = handleAsync("save", {
  run: (todo: Todo, api: AppApi) => api.getEntity("todoList")?.todos ?? [todo],
  success(entity: TodoListEntity, todos: Todo[], api: AppApi) {
    entity.todos = todos
    api.notify("#user:saved")
  },
  error(entity: TodoListEntity, error: Error) {
    entity.error = error.message
  },
})
export const saveTrigger: (
  entity: TodoListEntity,
  todo: Todo,
  api: AppApi,
) => void = annotated.save

type UserType = {
  rename: (entity: UserEntity, name: string) => void
} & AsyncEvents<"fetch", UserEntity, string, string, AppApi>

export const User: UserType = {
  rename(entity, name) {
    entity.name = name
  },
  ...handleAsync("fetch", {
    run: async (id: string) => `user ${id}`,
    success(entity: UserEntity, name: string) {
      entity.name = name
    },
  }),
}

export const explicit = handleAsync<TodoListEntity, void, Todo[]>("refresh", {
  run: () => fetchTodos("me"),
  success(entity, todos) {
    entity.todos = todos
  },
})
explicit.anyName?.(todoList, undefined, api)

export const Optimistic = {
  ...optimistic(
    handleAsync("add", {
      run: async (todo: Todo) => todo,
      success(entity: TodoListEntity, todo: Todo) {
        entity.todos.push(todo)
      },
    }),
    (entity, todo) => ({ todos: [...entity.todos, todo] }),
  ),
} satisfies EntityType<TodoListEntity, AppApi>
Optimistic.addStart(todoList, { id: 1, title: "a" }, api)

// ---- must fail ----

// @ts-expect-error: the generated event is loadSuccess
TodoList.loadSucess(todoList, [], api)

// @ts-expect-error: load takes the user id
TodoList.load(todoList, 1, api)

// @ts-expect-error: loadSuccess takes the todos
trigger(todoList, TodoList.loadSuccess, "todos")

export const wrongResult = {
  ...handleAsync("load", {
    run: () => fetchTodos("me"),
    success(entity, todos) {
      // @ts-expect-error: todos is a Todo[]
      entity.error = todos
    },
  }),
} satisfies EntityType<TodoListEntity, AppApi>

export const untypedApi = {
  ...handleAsync("load", {
    run: () => fetchTodos("me"),
    success(_entity, _todos, api) {
      // @ts-expect-error: UserEntity has no `nope`
      api.getEntity("user")?.nope
    },
  }),
} satisfies EntityType<TodoListEntity, AppApi>

// @ts-expect-error: UserType needs the generated events
export const missingEvents: UserType = {
  rename(entity, name) {
    entity.name = name
  },
}

// @ts-expect-error: UserType needs fetch, not load
export const wrongName: UserType = {
  rename(entity, name) {
    entity.name = name
  },
  ...handleAsync("load", {
    run: async (id: string) => id,
  }),
}

optimistic(
  handleAsync("remove", {
    run: async (id: number) => id,
    success(entity: TodoListEntity, id: number) {
      entity.todos = entity.todos.filter((todo) => todo.id !== id)
    },
  }),
  (entity, id) => ({
    // @ts-expect-error: the factory gets the payload, a number
    todos: entity.todos.slice(id.length),
  }),
)

// @ts-expect-error: the api must be an Api
handleAsync<TodoListEntity, void, Todo[], { notify: () => void }>("bad", {
  run: () => [],
})
