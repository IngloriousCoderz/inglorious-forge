import "./style.css"

import Footer from "./footer"
import Form from "./form"
import List from "./list"
import { Provider } from "./store"

export default function App() {
  return (
    <Provider>
      <h1>todos</h1>
      <Form />
      <List />
      <Footer />
    </Provider>
  )
}
