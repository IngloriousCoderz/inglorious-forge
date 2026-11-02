import { ref } from "@inglorious/web/directives/ref"

/**
 * Keeps an element's `checked` or `selected` property in step with the state.
 *
 * A `.checked=${false}` binding can't be used instead: server rendering
 * reflects it as `checked="false"`, which HTML reads as checked. Templates pair
 * this with the boolean attribute (`?checked=${value}`), which renders right on
 * the server but stops counting once the user has touched the control.
 * @param {"checked" | "selected"} name
 * @param {boolean} value
 */
export function liveBoolean(name, value) {
  return ref((element) => {
    if (element) element[name] = value
  })
}
