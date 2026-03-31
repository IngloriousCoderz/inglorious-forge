/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Api } from "@inglorious/web"

import { Message } from "./types/message"

export const App = {
  render(props: Record<string, unknown> | null, api: Api) {
    return (
      <h1>
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Message id="message1" />, <Message id="message2" />,{" "}
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Message id="message3" />!
      </h1>
    )
  },
}
