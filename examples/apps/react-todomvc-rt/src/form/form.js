export const Form = {
  inputChange(entity, value) {
    entity.value = value
  },

  formSubmit(entity) {
    entity.value = ""
  },
}
