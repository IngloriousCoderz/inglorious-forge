import type { AppState } from "../../types"

export const entities: AppState = {
  form: { type: "Form", value: "" },
  list: { type: "List", tasks: [] },
  footer: { type: "Footer", activeFilter: "all" },
}
