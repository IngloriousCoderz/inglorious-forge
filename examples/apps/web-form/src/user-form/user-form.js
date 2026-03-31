import { html } from "@inglorious/web"
import { Form } from "@inglorious/web/form"

import { input } from "./fields/input"
import { radio } from "./fields/radio"
import { select } from "./fields/select"
import classes from "./user-form.module.css"
import {
  validateAge,
  validateCity,
  validateFavoriteAnimal,
  validateForm,
  validateLanguages,
  validateName,
  validateSex,
  validateStreet,
} from "./validation"

export const UserForm = {
  ...Form,

  submit(entity, _, api) {
    if (!entity.isValid) {
      console.error("Form is not valid:", clone(entity.errors))
      return
    }

    alert("Submitted! " + JSON.stringify(entity.values))
    api.notify("#form:reset")
  },

  render(entity, api) {
    return html`<form
      @submit=${() => {
        api.notify("#form:validate", { validate: validateForm })
        api.notify("#form:submit")
      }}
    >
      <div class=${classes.fields}>
        ${input.render(
          entity,
          { label: "Name", path: "name", validate: validateName },
          api,
        )}
        ${input.render(
          entity,
          { type: "number", label: "Age", path: "age", validate: validateAge },
          api,
        )}
        ${radio.render(
          entity,
          {
            label: "Sex",
            options: [
              { value: "F", label: "Female" },
              { value: "M", label: "Male" },
            ],
            path: "sex",
            validate: validateSex,
          },
          api,
        )}
        ${select.render(
          entity,
          {
            label: "Favorite Animal",
            path: "favoriteAnimal",
            options: [
              { value: null, label: "" },
              { value: "cat", label: "Cat" },
              { value: "dog", label: "Dog" },
              { value: "seal", label: "Seal" },
            ],
            validate: validateFavoriteAnimal,
          },
          api,
        )}
        ${select.render(
          entity,
          {
            label: "Languages",
            path: "languages",
            options: [
              { value: "en", label: "English" },
              { value: "it", label: "Italian" },
              { value: "js", label: "JavaScript" },
            ],
            isMultiple: true,
            validate: validateLanguages,
          },
          api,
        )}

        <div>Addresses</div>
        <div>
          <button
            @click=${() =>
              api.notify("#form:fieldArrayAppend", {
                path: "addresses",
                value: { street: "", city: "" },
              })}
          >
            Add
          </button>

          ${entity.values.addresses.length
            ? html`<ul>
                ${entity.values.addresses.map(
                  (_, index) =>
                    html`<li>
                      ${input.render(
                        entity,
                        {
                          label: "Street",
                          path: `addresses.${index}.street`,
                          validate: validateStreet,
                        },
                        api,
                      )}
                      ${input.render(
                        entity,
                        {
                          label: "City",
                          path: `addresses.${index}.city`,
                          validate: validateCity,
                        },
                        api,
                      )}

                      <button
                        @click=${() =>
                          api.notify("#form:fieldArrayRemove", {
                            path: "addresses",
                            index,
                          })}
                      >
                        x
                      </button>
                    </li>`,
                )}
              </ul>`
            : ""}
        </div>

        <div>Actions</div>
        <div>
          <button
            ?disabled=${entity.isPristine}
            @click=${() => api.notify("#form:reset")}
          >
            Reset
          </button>
          <button
            type="submit"
            ?disabled=${entity.isPristine || !entity.isValid}
          >
            Submit
          </button>
        </div>
      </div>
    </form>`
  },
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
