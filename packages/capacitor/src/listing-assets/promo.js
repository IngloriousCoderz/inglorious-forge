/**
 * The promotional images, in CSS pixels rendered at `scale`:
 * - `feature-graphic`: Google Play's banner above the listing.
 * - `header`: a wide banner whose middle 3:2 is what an iPhone shows, so the
 *   text stays there and the screenshots sit at the edges.
 * - `search-results`: a 3:2 card, the text beside one screenshot.
 */
export const PROMO_FORMATS = {
  "feature-graphic": { width: 1024, height: 500, scale: 1 },
  header: { width: 1920, height: 823, scale: 2 },
  "search-results": { width: 960, height: 640, scale: 2 },
}

const DEFAULT_COLOR = "#1f1f1f"
const DEFAULT_FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
const PERCENT = 100
const HALF = 2

// Sizes in hundredths of the image's height.
const FEATURE_GRAPHIC = {
  gap: 11,
  padding: 16,
  logo: 40,
  name: 19,
  tagline: 7.5,
}
const HEADER = {
  safeRatio: 1.5,
  phoneTop: 11,
  phoneSide: 2,
  phoneHeight: 79,
  textTop: 18,
  textBottom: 8,
  logo: 16,
  name: 17,
  taglineGap: 5,
  tagline: 8.5,
}
const SEARCH_RESULTS = {
  textShare: 0.55,
  padding: 8,
  phoneHeight: 82,
  logo: 14,
  name: 13,
  taglineGap: 5,
  tagline: 6.5,
  subtitleGap: 3,
  subtitle: 3.6,
  subtitleOpacity: 0.75,
}
const BRAND_GAP = 3
const ACCENT = { gap: 4, width: 14, height: 1 }
const PHONE = { radius: 5, border: 0.9, shadowY: 2, shadowBlur: 6 }

const LAYOUTS = {
  "feature-graphic": featureGraphic,
  header,
  "search-results": searchResults,
}

/**
 * @param {keyof typeof PROMO_FORMATS} format
 * @param {{ logo: string, name: string, tagline?: string, subtitle?: string, shots?: string[], background: string, color?: string, accent?: string, font?: string }} options
 *   `logo` and `shots` are image addresses.
 * @returns {string} A whole HTML page.
 */
export function promoHtml(format, options) {
  const { width, height } = PROMO_FORMATS[format]
  const style = {
    color: DEFAULT_COLOR,
    font: DEFAULT_FONT,
    tagline: "",
    subtitle: "",
    shots: [],
    ...options,
  }
  const unit = height / PERCENT
  return `<!doctype html><html><body style="margin:0">
<div style="position:relative;width:${width}px;height:${height}px;box-sizing:border-box;overflow:hidden;
  background:${style.background};color:${style.color};font-family:${style.font}">
${LAYOUTS[format]({ width, height, unit, ...style })}
</div></body></html>`
}

function featureGraphic({ unit, logo, name, tagline }) {
  const size = scaled(FEATURE_GRAPHIC, unit)
  return `<div style="height:100%;display:flex;align-items:center;gap:${size.gap}px;padding:0 ${size.padding}px">
  <img src="${logo}" style="height:${size.logo}px;flex:none">
  <div>
    <div style="font-size:${size.name}px;line-height:1">${escapeHtml(name)}</div>
    ${text(tagline, `margin-top:${size.tagline}px;font-size:${size.tagline}px;line-height:1.25`)}
  </div>
</div>`
}

function header({
  width,
  height,
  unit,
  logo,
  name,
  tagline,
  shots,
  color,
  accent,
}) {
  const size = scaled(HEADER, unit)
  const safeWidth = Math.round(height * HEADER.safeRatio)
  const safeLeft = (width - safeWidth) / HALF
  const [left, right] = shots
  const placement = (side) =>
    `top:${size.phoneTop}px;${side}:${size.phoneSide}px;height:${size.phoneHeight}px`
  return `${left ? phone(left, unit, color, placement("left")) : ""}
${right ? phone(right, unit, color, placement("right")) : ""}
<div style="position:absolute;left:${safeLeft}px;width:${safeWidth}px;top:${size.textTop}px;bottom:${size.textBottom}px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
  ${brand(unit, logo, name, size)}
  ${text(tagline, `margin-top:${size.taglineGap}px;font-size:${size.tagline}px;line-height:1.2`)}
  ${accentBar(unit, accent)}
</div>`
}

function searchResults({
  width,
  unit,
  logo,
  name,
  tagline,
  subtitle,
  shots,
  color,
  accent,
}) {
  const size = scaled(SEARCH_RESULTS, unit)
  const [shot] = shots
  return `<div style="height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 ${size.padding}px">
  <div style="max-width:${width * SEARCH_RESULTS.textShare}px">
    ${brand(unit, logo, name, size)}
    ${text(tagline, `margin-top:${size.taglineGap}px;font-size:${size.tagline}px;line-height:1.2`)}
    ${text(subtitle, `margin-top:${size.subtitleGap}px;font-size:${size.subtitle}px;line-height:1.4;opacity:${SEARCH_RESULTS.subtitleOpacity}`)}
    ${accentBar(unit, accent)}
  </div>
  ${shot ? phone(shot, unit, color, `position:static;height:${size.phoneHeight}px`) : ""}
</div>`
}

function scaled(sizes, unit) {
  return Object.fromEntries(
    Object.entries(sizes).map(([key, value]) => [key, value * unit]),
  )
}

function brand(unit, logo, name, size) {
  return `<div style="display:flex;align-items:center;gap:${BRAND_GAP * unit}px">
    <img src="${logo}" style="height:${size.logo}px">
    <span style="font-size:${size.name}px;line-height:1">${escapeHtml(name)}</span>
  </div>`
}

function text(value, style) {
  return value ? `<div style="${style}">${lines(value)}</div>` : ""
}

function accentBar(unit, accent) {
  if (!accent) return ""
  const size = scaled(ACCENT, unit)
  return `<div style="margin-top:${size.gap}px;width:${size.width}px;height:${size.height}px;border-radius:${size.height}px;background:${accent}"></div>`
}

function phone(src, unit, color, placement) {
  const size = scaled(PHONE, unit)
  return `<img src="${src}" style="position:absolute;${placement};border-radius:${size.radius}px;
  border:${size.border}px solid ${color};box-shadow:0 ${size.shadowY}px ${size.shadowBlur}px rgba(0,0,0,.2)">`
}

function lines(value) {
  return escapeHtml(value).split("\n").join("<br>")
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
