import { useSelector } from "react-redux"

import { withAbsolutePosition } from "../hocs/with-absolute-position/index.jsx"
import Character from "./character/index.jsx"
import Cursor from "./cursor/index.jsx"
import Form from "./form/index.jsx"
import Fps from "./fps/index.jsx"
import Platform from "./platform/index.jsx"
import Scene from "./scene/index.jsx"
import Sprite from "./sprite/index.jsx"
import Stats from "./stats/index.jsx"

const Components = {
  character: withAbsolutePosition(Character),
  mouse: withAbsolutePosition(Cursor),
  form: withAbsolutePosition(Form),
  fps: withAbsolutePosition(Fps),
  platform: withAbsolutePosition(Platform),
  sprite: withAbsolutePosition(Sprite),
  stats: withAbsolutePosition(Stats),
}

const Y = 1
const Z = 2

export default function Game({ engine }) {
  // NOTE: don't use simply engine.entities here: need to subscribe to animate scene!
  const entities = useSelector((state) => state)

  const types = engine._store.getTypes()
  const { mouse, ...rest } = entities
  const options = { types, entities }

  const render = createDraw(options)

  return (
    <Scene entities={entities}>
      {Object.values(rest)
        .filter(({ position }) => position)
        .toSorted(
          (a, b) =>
            a.layer - b.layer ||
            a.position[Y] - b.position[Y] ||
            b.position[Z] - a.position[Z],
        )
        .map(render)}
      {mouse && render(mouse)}
    </Scene>
  )
}

function createDraw(options) {
  return function Draw(entity) {
    const { types, entities } = options
    const type = types[entity.type]

    const Component = entity.sprite
      ? Components.sprite
      : Components[entity.type]

    return (
      <Component
        key={entity.id}
        id={entity.id}
        type={type}
        entity={entity}
        entities={entities}
      />
    )
  }
}
