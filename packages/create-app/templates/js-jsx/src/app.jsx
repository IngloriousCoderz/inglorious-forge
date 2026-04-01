import { Message } from "./types/message"

export const App = {
  render() {
    return (
      <h1>
        <Message entityId="message1" />, <Message entityId="message2" />,{" "}
        <Message entityId="message3" />!
      </h1>
    )
  },
}
