import { useDispatch, useSelector } from "react-redux"
import { selectValue } from "./store/selectors"

export default function Form() {
  const dispatch = useDispatch()

  const value = useSelector(selectValue)
  const handleChange = (event) =>
    dispatch({ type: "inputChange", payload: event.target.value })

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch({ type: "formSubmit", payload: value })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="What next?"
        autoFocus
        value={value}
        onChange={handleChange}
      />
      <button disabled={!value.length}>Add</button>
    </form>
  )
}
