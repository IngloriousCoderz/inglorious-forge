import { Footer } from "./footer/footer"
import { Form } from "./form/form"
import { List } from "./list/list"

export const App = {
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
