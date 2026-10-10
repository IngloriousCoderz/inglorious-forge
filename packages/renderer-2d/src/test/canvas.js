/**
 * A canvas context that records rather than draws.
 *
 * Every renderer in this package takes `(entity, ctx)`, so a test for one is a test for
 * what it asks a canvas to do. That means a context that answers the calls and remembers
 * them, including the transform stack -- because most of what a renderer gets wrong is a
 * position that is off by the flip, and that is only visible once the matrix is applied.
 *
 * @returns {{calls: Array, ctx: Object}} What was asked for, and the context to ask with.
 */
export function createContext() {
  let matrix = [1, 0, 0, 1, 0, 0]
  const stack = []
  const calls = []

  const record =
    (name) =>
    (...args) =>
      calls.push([name, ...args])

  const multiply = (n) => {
    const [a, b, c, d, e, f] = matrix
    const [A, B, C, D, E, F] = n

    matrix = [
      a * A + c * B,
      b * A + d * B,
      a * C + c * D,
      b * C + d * D,
      a * E + c * F + e,
      b * E + d * F + f,
    ]
  }

  const apply = ([x, y]) => [
    matrix[0] * x + matrix[2] * y + matrix[4],
    matrix[1] * x + matrix[3] * y + matrix[5],
  ]

  const boxOf = (x, y, width, height) => {
    const corners = [
      apply([x, y]),
      apply([x + width, y]),
      apply([x, y + height]),
      apply([x + width, y + height]),
    ]

    return {
      left: Math.min(...corners.map(([cx]) => cx)),
      right: Math.max(...corners.map(([cx]) => cx)),
      top: Math.min(...corners.map(([, cy]) => cy)),
      bottom: Math.max(...corners.map(([, cy]) => cy)),
    }
  }

  return {
    calls,
    /** Where `point` lands on the canvas, transform and all. */
    at: apply,
    ctx: {
      save: (...args) => {
        record("save")(...args)
        stack.push(matrix)
      },
      restore: (...args) => {
        record("restore")(...args)
        matrix = stack.pop()
      },
      translate: (x, y) => {
        record("translate")(x, y)
        multiply([1, 0, 0, 1, x, y])
      },
      scale: (x, y) => {
        record("scale")(x, y)
        multiply([x, 0, 0, y, 0, 0])
      },
      rotate: (angle) => {
        record("rotate")(angle)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        multiply([cos, sin, -sin, cos, 0, 0])
      },
      set fillStyle(value) {
        record("fillStyle")(value)
      },
      set strokeStyle(value) {
        record("strokeStyle")(value)
      },
      set globalAlpha(value) {
        record("globalAlpha")(value)
      },
      set lineWidth(value) {
        record("lineWidth")(value)
      },
      fillRect(x, y, width, height) {
        record("fillRect")(x, y, width, height)
        calls.box = boxOf(x, y, width, height)
      },
      strokeRect(x, y, width, height) {
        record("strokeRect")(x, y, width, height)
        calls.box = boxOf(x, y, width, height)
      },
      clearRect(x, y, width, height) {
        record("clearRect")(x, y, width, height)
      },
      beginPath: (...args) => record("beginPath")(...args),
      closePath: (...args) => record("closePath")(...args),
      moveTo: (...args) => record("moveTo")(...args),
      lineTo: (...args) => record("lineTo")(...args),
      arc: (...args) => record("arc")(...args),
      fill: (...args) => record("fill")(...args),
      stroke: (...args) => record("stroke")(...args),
      fillText: (...args) => record("fillText")(...args),
      set fillText_(value) {},
      font: "",
      textAlign: "",
      textBaseline: "",
      drawImage: (...args) => {
        record("drawImage")(...args)
        // The last four of the nine are where it lands; the four before them are where it
        // was cut from, which is a different box entirely.
        const [, , , , , dx, dy, dw, dh] = args
        calls.box = boxOf(dx, dy, dw, dh)
      },
    },
  }
}

/**
 * What was asked for under a given name, in order.
 *
 * @param {Array} calls - The recorded calls.
 * @param {string} name - The call to pick out.
 * @returns {Array[]} The arguments of each, in order.
 */
export function callsTo(calls, name) {
  return calls.filter(([called]) => called === name)
}
