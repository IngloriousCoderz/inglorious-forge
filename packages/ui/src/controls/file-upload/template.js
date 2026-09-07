/**
 * @typedef {import('../../../types/controls/file-upload').FileUploadProps} FileUploadProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"

import { applyElementProps } from "../../shared/applyElementProps.js"

/**
 * Renders a labeled file upload area with optional summary, hint, and error text.
 * Supports drag-and-drop handling through file input semantics.
 * @param {FileUploadProps} props
 * @returns {TemplateResult}
 */
export function render(props) {
  const {
    id,
    name = "",
    label,
    hint,
    error,
    accept,
    isMultiple = false,
    isDisabled = false,
    isRequired = false,
    isFullWidth = false,
    selectedFiles = [],
    title = "Choose files",
    description = "or drag and drop here",
    onChange,
    onBlur,
    onFocus,
    ...rest
  } = props

  const uploadId = id || name || "file-upload"

  const wrapperClasses = {
    "iw-upload": true,
    "iw-upload-full-width": isFullWidth,
    "iw-upload-disabled": isDisabled,
    "iw-upload-has-error": !!error,
  }

  const fieldClasses = {
    "iw-upload-field-box": true,
    "iw-upload-field-error": !!error,
  }

  const summaryText =
    selectedFiles.length > 0 ? selectedFiles.join(", ") : "No file selected"

  return html`
    <div class=${classMap(wrapperClasses)}>
      ${
        label
          ? html`
              <label for=${uploadId} class="iw-upload-label">
                ${label}
                ${
                  isRequired
                    ? html`<span class="iw-upload-required">*</span>`
                    : null
                }
              </label>
            `
          : null
      }

      <div class=${classMap(fieldClasses)}>
        <input
          id=${uploadId}
          name=${name}
          type="file"
          accept=${accept ?? ""}
          ?multiple=${isMultiple}
          ?disabled=${isDisabled}
          ?required=${isRequired}
          class="iw-upload-input"
          @change=${(event) => onChange?.(event.target.files)}
          @blur=${onBlur}
          @focus=${onFocus}
          ${ref((element) => applyElementProps(element, rest))}
        />

        <div class="iw-upload-content">
          <span class="iw-upload-title">${title}</span>
          <span class="iw-upload-description">${description}</span>
        </div>
      </div>

      <div class="iw-upload-field-summary">${summaryText}</div>

      ${
        error
          ? html`<span class="iw-upload-error-message">${error}</span>`
          : hint
            ? html`<span class="iw-upload-hint">${hint}</span>`
            : null
      }
    </div>
  `
}
