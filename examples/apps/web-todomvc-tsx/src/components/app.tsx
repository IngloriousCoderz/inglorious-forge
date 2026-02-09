export const app = {
  render() {
    return (
      <>
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Form />
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <List />
        {/* @ts-expect-error - JSX components are entity type names, not imports */}
        <Footer />
      </>
    )
  },
}
