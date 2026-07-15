// Self-contained demo images for the Before/After control, so the dashboard
// renders the comparison without any network requests.

const svg = (label, from, to) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="960" height="540" fill="url(#g)"/>
      <text x="48" y="496" font-family="sans-serif" font-size="72" font-weight="700"
            fill="rgba(255,255,255,0.92)">${label}</text>
    </svg>`,
  )

export const beforeAfterImages = {
  before: {
    src: svg("BEFORE", "#9ca3af", "#374151"),
    alt: "Before — grayscale",
  },
  after: {
    src: svg("AFTER", "#22d3ee", "#4f46e5"),
    alt: "After — color graded",
  },
}
