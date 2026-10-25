import { useEntity, useNotify } from "./store"

export default function Form() {
  const notify = useNotify()

  const { value } = useEntity("form")
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    notify("inputChange", event.target.value)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    notify("formSubmit", value)
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
