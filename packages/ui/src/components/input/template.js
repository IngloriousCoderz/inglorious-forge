/** @typedef {import('../../../types/input').InputEntity} InputEntity */
/** @typedef {import('@inglorious/web').Api} Api */
/** @typedef {import('@inglorious/web').TemplateResult} TemplateResult */

import { classMap, html } from "@inglorious/web"

/**
 * Input component for Inglorious Web.
 *
 * @example
 * // Stateless usage
 * input.render({ label: 'Email', type: 'email', placeholder: 'you@example.com' }, api)
 *
 * @example
 * // Stateful usage with event handling
 * // Entity: { type: 'input', id: 'emailInput', label: 'Email' }
 * // In store: api.render('emailInput')
 *
 * @param {InputEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    name = "",
    type = "text",
    value = "",
    placeholder = "",
    label,
    hint,
    error,
    size = "md",
    disabled = false,
    readonly = false,
    required = false,
    fullWidth = false,
    icon,
    iconAfter,
  } = entity

  const inputId = entity.id || name

  const wrapperClasses = {
    "iw-input-wrapper": true,
    [`iw-input-wrapper--${size}`]: size !== "md",
    "iw-input-wrapper--full-width": fullWidth,
    "iw-input-wrapper--disabled": disabled,
    "iw-input-wrapper--error": !!error,
    "iw-input-wrapper--has-icon": !!icon,
    "iw-input-wrapper--has-icon-after": !!iconAfter,
  }

  const inputClasses = {
    "iw-input": true,
    [`iw-input--${size}`]: size !== "md",
    "iw-input--error": !!error,
  }

  return html`
    <div class=${classMap(wrapperClasses)}>
      ${label
        ? html`
            <label for=${inputId} class="iw-input__label">
              ${label}
              ${required
                ? html`<span class="iw-input__required">*</span>`
                : null}
            </label>
          `
        : null}

      <div class="iw-input-container">
        ${icon ? html`<span class="iw-input__icon">${icon}</span>` : null}

        <input
          id=${inputId}
          name=${name}
          type=${type}
          .value=${value}
          placeholder=${placeholder}
          ?disabled=${disabled}
          ?readonly=${readonly}
          ?required=${required}
          class=${classMap(inputClasses)}
          @input=${(event) =>
            api.notify(`#${entity.id}:change`, event.target.value)}
          @blur=${() => api.notify(`#${entity.id}:blur`)}
          @focus=${() => api.notify(`#${entity.id}:focus`)}
        />

        ${iconAfter
          ? html`<span class="iw-input__icon iw-input__icon--after"
              >${iconAfter}</span
            >`
          : null}
      </div>

      ${error
        ? html`<span class="iw-input__error">${error}</span>`
        : hint
          ? html`<span class="iw-input__hint">${hint}</span>`
          : null}
    </div>
  `
}
