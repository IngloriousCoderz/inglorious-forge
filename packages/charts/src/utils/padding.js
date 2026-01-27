/* eslint-disable no-magic-numbers */

/**
 * Calculate padding based on chart dimensions
 * @param {number} [width=800] - Chart width
 * @param {number} [height=400] - Chart height
 * @returns {Object} Padding object with top, right, bottom, left
 */
export function calculatePadding(width = 800, height = 400) {
  return {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }
}

