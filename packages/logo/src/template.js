/**
 * @typedef {Object} FaceSpec
 * @property {string} image - svg key (A..Z)
 * @property {boolean} [reverse] - whether the face image should be flipped horizontally
 * @property {boolean} [eye] - whether to render the small eye asset on the face
 *
 * @typedef {Object} LogoEntity
 * @property {string} id
 * @property {number} size
 * @property {number} x
 * @property {number} y
 * @property {[FaceSpec,FaceSpec]} faces - tuple: [leftFace, rightFace]
 * @property {boolean} [isInteractive]
 * @property {boolean} [isScrollPrevented]
 */

import { html, styleMap, when } from "@inglorious/web"

import eye from "./assets/eye.svg"
import * as faces from "./assets/faces/index.js"

const MINUS_FORTY_DEGREES = -0.6981
const MINUS_FORTY_FIVE_DEGREES = -0.7854
const DEFAULT_SIZE = 256
const DEFAULT_COORDS = 0
const STEP = 0.001
const HALF = 0.5

/**
 * Render the logo template for a `LogoEntity`.
 * The returned value is a lit-html `TemplateResult` produced by `html`.
 *
 * @param {LogoEntity} entity
 * @returns {import('lit-html').TemplateResult}
 */
export function render(entity) {
  const { size = DEFAULT_SIZE, x = DEFAULT_COORDS, y = DEFAULT_COORDS } = entity
  const [left, right] = entity.faces

  return html`<div
    class="iw-logo"
    style=${styleMap({
      "--size": `${size}px`,
      "--transform": `scaleY(1.2) translateZ(-${size}px) rotateX(${
        MINUS_FORTY_DEGREES - STEP * y
      }rad)
          rotateY(${MINUS_FORTY_FIVE_DEGREES + STEP * x}rad)`,
      "--z-translation": `${size * HALF}px`,
      "--left-face-flip": left.reverse ? "rotateY(180deg)" : "none",
      "--right-face-flip": right.reverse ? "rotateY(180deg)" : "none",
    })}
  >
    <div class="iw-logo-cube">
      <div class="iw-logo-cube-face left">
        <img src=${faces[left.image]} alt=${left.image} />
        ${when(
          left.eye,
          () =>
            html`<img
              class="iw-logo-cube-face-eye"
              src=${eye}
              alt="left eye"
            />`,
        )}
      </div>
      <div class="iw-logo-cube-face right">
        <img src=${faces[right.image]} alt=${right.image} />
        ${when(
          right.eye,
          () =>
            html`<img
              class="iw-logo-cube-face-eye"
              src=${eye}
              alt="right eye"
            />`,
        )}
      </div>
    </div>
  </div>`
}
