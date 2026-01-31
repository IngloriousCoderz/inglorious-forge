export const app = {
  render() {
    return (
      <h1>
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Message1 />, <Message2 />, <Message3 />!
      </h1>
    )
  },
}
