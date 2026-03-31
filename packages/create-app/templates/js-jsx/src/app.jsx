import { Message } from "./types/message"

export const App = {
  render() {
    return (
      <h1>
        <Message id="message1" />, <Message id="message2" />,{" "}
        <Message id="message3" />!
      </h1>
    )
  },
}
