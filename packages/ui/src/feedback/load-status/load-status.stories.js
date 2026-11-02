import { createRender } from "../../stories/notify-story.js"
import { LoadStatus } from "."

export default {
  title: "Feedback/LoadStatus",
  tags: ["autodocs"],
  render: createRender(LoadStatus),
}

export const Loading = { args: { isLoading: true } }

export const Empty = { args: { isEmpty: true, emptyText: "No events yet." } }

export const Error = {
  args: { isError: true, error: "The events could not be loaded." },
}
