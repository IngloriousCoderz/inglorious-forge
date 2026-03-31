import * as handlers from "./handlers.js"
import * as helpers from "./helpers.js"

export const Form = { ...handlers }

export const { getFieldError, getFieldValue, isFieldTouched } = helpers
