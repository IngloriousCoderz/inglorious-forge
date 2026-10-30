export function isTouchDevice() {
  if (typeof window === "undefined") return false

  if (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch)
  ) {
    return true
  }

  const prefixes = " -webkit- -moz- -o- -ms- ".split(" ")
  var query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("")
  return window.matchMedia(query).matches
}

export function saturate(num, limit) {
  if (num < -limit) return -limit
  if (num > limit) return limit
  return num
}

export function closestAncestor(el, className) {
  const limit = 4
  let i = 0
  let closest = el
  while (closest && i < limit) {
    if (
      closest.className == null ||
      typeof closest.className.split !== "function"
    ) {
      return null
    }

    const classes = closest.className.split(" ")
    if (classes.includes(className)) {
      return closest
    }

    closest = closest.parentNode
    i++
  }
}
