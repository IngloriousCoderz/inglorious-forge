/**
 * The CSS anchor name that ties a popover to the element it opens from.
 * Set as `anchor-name` on the trigger and `position-anchor` on the popover,
 * so the browser positions the popover against it, flipping when it runs out
 * of room. Built from the popover's id, which is unique on the page.
 * @param {string} id
 * @returns {string}
 */
export function anchorName(id) {
  return `--iw-anchor-${String(id).replace(/[^\w-]/g, "-")}`
}
