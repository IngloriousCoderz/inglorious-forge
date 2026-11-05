import { Message } from "./message"

export const App = {
  render() {
    return (
      <h1>
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Message entityId="message1" />, <Message entityId="message2" />,{" "}
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Message entityId="message3" />!
      </h1>
    )
  },
}
