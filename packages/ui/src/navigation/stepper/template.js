/**
 * @typedef {import('../../../types/navigation/stepper').StepperProps} StepperProps
 * @typedef {import('../../../types/navigation/stepper').Step} Step
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html } from "@inglorious/web"

export const stepper = {
  /**
   * @param {StepperProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      steps = [],
      activeStep = 0,
      orientation = "horizontal",
      alternativeLabel = false,
    } = props

    return html`<ol
      class=${classMap({
        "iw-stepper": true,
        [`iw-stepper-${orientation}`]: true,
        "iw-stepper-alternative-label": alternativeLabel,
      })}
    >
      ${steps.map((step, index) =>
        this.renderStep(step, index, { ...props, activeStep }),
      )}
    </ol>`
  },

  /**
   * @param {Step} step
   * @param {number} index
   * @param {StepperProps} props
   * @returns {TemplateResult}
   */
  renderStep(step, index, props) {
    const completed = step.completed ?? index < props.activeStep
    const active = index === props.activeStep

    return html`<li
      class=${classMap({
        "iw-stepper-step": true,
        "iw-stepper-step-active": active,
        "iw-stepper-step-completed": completed,
      })}
    >
      <span class="iw-stepper-indicator">${completed ? "✓" : index + 1}</span>
      <span class="iw-stepper-content">
        <span class="iw-stepper-label">${step.label}</span>
        ${step.optional
          ? html`<span class="iw-stepper-optional">${step.optional}</span>`
          : null}
      </span>
    </li>`
  },
}
