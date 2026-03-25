export function showTooltip(svgEl, x, y, label, value, color) {
  if (!svgEl) return

  let group = svgEl.querySelector(".iw-chart-modal-fallback")

  if (!group) {
    svgEl.insertAdjacentHTML("beforeend", createFallbackTemplate())
    group = svgEl.querySelector(".iw-chart-modal-fallback")
  }
  if (!group) return

  group.setAttribute("transform", `translate(${x}, ${y})`)
  group.setAttribute("display", "inline")

  group
    .querySelector('[data-role="dot"]')
    ?.setAttribute("fill", color || "#3b82f6")
  const labelNode = group.querySelector('[data-role="label"]')
  if (labelNode) labelNode.textContent = String(label ?? "")
  const valueNode = group.querySelector('[data-role="value"]')
  if (valueNode) valueNode.textContent = String(value ?? "")
}

export function hideTooltip(svgEl) {
  svgEl
    ?.querySelector?.(".iw-chart-modal-fallback")
    ?.setAttribute("display", "none")
}

function createFallbackTemplate() {
  return `
    <g class="iw-chart-modal-fallback" pointer-events="none" display="none">
      <rect x="0" y="0" width="132" height="50" rx="6" ry="6" fill="white" fill-opacity="0.95" stroke="#cbd5e1"></rect>
      <circle data-role="dot" cx="12" cy="16" r="4" fill="#3b82f6"></circle>
      <text data-role="label" x="22" y="17" fill="#475569" font-size="12"></text>
      <text data-role="value" x="22" y="35" fill="#0f172a" font-size="13" font-weight="600"></text>
    </g>
  `
}
