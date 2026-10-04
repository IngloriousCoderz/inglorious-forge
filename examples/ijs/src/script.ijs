/* eslint-disable no-magic-numbers */
import { toString } from "@inglorious/utils/vectors"

{
  const position = v(10, 20, 30)
  const velocity = v(1, 1.5, 2)
  const deltaTime = 0.16
  const worldSize = 20

  const newPosition = (position + velocity * deltaTime) % worldSize

  document.querySelector("#vectors").innerHTML =
    `<div>Original Position: <code>${toString(position)}</code></div>
  <div>New Position: <code>${toString(newPosition, 2)}</code></div>`
}

{
  const position = v(10, 20, 30)
  const [x, y, z] = position

  document.querySelector("#is-vector").innerHTML =
    `<div>x: <code>${x}</code> y: <code>${y.toFixed(2)}</code> z: <code>${z}</code></div>
<div><code>position.__isVector__ === ${position.__isVector__}</code></div>`
}

{
  const position = [10, 20, 30]
  const velocity = [1, 1.5, 2]
  const deltaTime = 0.16
  const worldSize = 20

  const newPosition = (position + velocity * deltaTime) % worldSize

  document.querySelector("#arrays").innerHTML =
    `<div>Original Position: <code>${toString(position)}</code></div>
<div>New Position: <code>"${newPosition}"</code></div>`
}
