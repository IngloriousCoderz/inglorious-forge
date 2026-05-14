import { html } from "@inglorious/web"
import { getFieldValue } from "@inglorious/web/form"

import classes from "./logo-form.module.css"

const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]
const LEFT = 0
const RIGHT = 1

export function render(entity, api) {
  const [xRotation, yRotation] = entity.values.rotation

  return html`<div class=${classes.logoForm}>
    <label for="size">Size</label>
    <input
      id="size"
      type="number"
      min="16"
      max="1024"
      .value=${entity.values.size}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: "size",
          value: Number(event.target.value),
        })}
    />

    <label for="xRotation">X Rotation</label>
    <input
      id="xRotation"
      type="number"
      min="-180"
      max="180"
      .value=${xRotation}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: "rotation.0",
          value: Number(event.target.value),
        })}
    />

    <label for="yRotation">Y Rotation</label>
    <input
      id="yRotation"
      type="number"
      min="-180"
      max="180"
      .value=${yRotation}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: "rotation.1",
          value: Number(event.target.value),
        })}
    />

    <label for="skew">Skew</label>
    <input
      id="skew"
      type="number"
      min="0"
      max="90"
      .value=${entity.values.skew}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: "skew",
          value: Number(event.target.value),
        })}
    />

    <label for="interactive">Interactive</label>
    <input
      id="interactive"
      type="checkbox"
      ?checked=${entity.values.isInteractive}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: "isInteractive",
          value: event.target.checked,
        })}
    />

    <h3>Left</h3>
    <div></div>
    ${renderFace(entity, LEFT, api)}

    <h3>Right</h3>
    <div></div>
    ${renderFace(entity, RIGHT, api)}
  </div>`
}

function renderFace(entity, face, api) {
  return html`<label for="faces.${face}.image">Letter</label>
    <select
      id="faces.${face}.image"
      @input=${(event) =>
        api.notify("fieldChange", {
          path: `faces.${face}.image`,
          value: event.target.value,
        })}
    >
      ${LETTERS.map(
        (letter) =>
          html`<option
            ?selected=${letter === getFieldValue(entity, `faces.${face}.image`)}
          >
            ${letter}
          </option>`,
      )}
    </select>
    <label for="faces.${face}.reverse">Reverse</label>
    <input
      id="faces.${face}.reverse"
      type="checkbox"
      ?checked=${getFieldValue(entity, `faces.${face}.reverse`)}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: `faces.${face}.reverse`,
          value: event.target.checked,
        })}
    />
    <label for="faces.${face}.eye">Eye</label>
    <input
      id="faces.${face}.eye"
      type="checkbox"
      ?checked=${getFieldValue(entity, `faces.${face}.eye`)}
      @input=${(event) =>
        api.notify("fieldChange", {
          path: `faces.${face}.eye`,
          value: event.target.checked,
        })}
    />`
}
