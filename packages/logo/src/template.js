/**
 * @typedef {import("../types/index.d.ts").LogoEntity} LogoEntity
 */

import { html, nothing } from "@inglorious/web"
import { styleMap } from "@inglorious/web/directives/style-map"
import { when } from "@inglorious/web/directives/when"

import eye from "./assets/eye.svg"
import * as faces from "./assets/faces/index.js"

const DEFAULT_POSITION = [0, 0] // eslint-disable-line no-magic-numbers
const DEFAULT_ROTATION = [-45, -40] // eslint-disable-line no-magic-numbers
const DEFAULT_SIZE = 256
const DEFAULT_SKEW = 12
// 0.001 radians, the tilt the head has always had per pixel of pointer offset.
const TILT_DEGREES_PER_PIXEL = 0.0573
const HALF = 0.5

export const template = {
  /**
   * Render the logo template for a `LogoEntity`.
   * The returned value is a lit-html `TemplateResult` produced by `html`.
   *
   * @param {LogoEntity} entity
   * @returns {import('lit-html').TemplateResult}
   */
  render(entity) {
    const {
      size = DEFAULT_SIZE,
      position = DEFAULT_POSITION,
      rotation = DEFAULT_ROTATION,
      skew = DEFAULT_SKEW,
    } = entity
    const [x, y] = position
    const [hRotation, vRotation] = rotation
    const [left, right] = entity.faces

    return html`<div
      class="iw-logo"
      data-entity-id=${entity.id ?? nothing}
      style=${styleMap({
        "--size": `${size}px`,
        "--transform": `scaleY(1.2) translateZ(-${size}px) rotateX(${
          vRotation - TILT_DEGREES_PER_PIXEL * y
        }deg)
            rotateY(${hRotation + TILT_DEGREES_PER_PIXEL * x}deg)`,
        "--z-translation": `${size * HALF}px`,
        "--left-face-flip": left.reverse ? "rotateY(180deg)" : "none",
        "--right-face-flip": right.reverse ? "rotateY(180deg)" : "none",
        "--skew": `${skew}deg`,
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
  },
}
