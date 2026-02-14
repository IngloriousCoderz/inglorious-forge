import { useDispatch, useSelector } from "react-redux"

import { formSubmit } from "../store/actions"
import { selectValue } from "../store/selectors"
import { inputChange } from "./form"

export default function Form() {
  const dispatch = useDispatch()

  const value = useSelector(selectValue)
  const handleChange = (event) => dispatch(inputChange(event.target.value))

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(formSubmit(value))
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
