/**
 * @typedef {import('../../../types/navigation/stepper').StepperProps} StepperProps
 * @typedef {import('../../../types/navigation/stepper').Step} Step
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

export const Stepper = {
  /**
   * Main entrypoint for the stepper component. Delegates to the base renderer for overrides.
   * Steppers render a sequence of steps with completion states.
   * @param {StepperProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    return this.renderStepper(props)
  },

  /**
   * Renders the ordered list of steps with orientation styling.
   * Each step is delegated to `renderStep`.
   * @param {StepperProps} props
   * @returns {TemplateResult}
   */
  renderStepper(props) {
    const {
      steps = [],
      activeStep = 0,
      orientation = "horizontal",
      isAlternativeLabel = false,
    } = props

    return html`<ol
      class=${classMap({
        "iw-stepper": true,
        [`iw-stepper-${orientation}`]: true,
        "iw-stepper-alternative-label": isAlternativeLabel,
      })}
    >
      ${steps.map((step, index) =>
        this.renderStep(step, index, { ...props, activeStep }),
      )}
    </ol>`
  },

  /**
   * Renders a single step with label, optional text, and completion state.
   * Calculates active/completed styling based on the current step.
   * @param {Step} step
   * @param {number} index
   * @param {StepperProps} props
   * @returns {TemplateResult}
   */
  renderStep(step, index, props) {
    const completed = step.isCompleted ?? index < props.activeStep
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
