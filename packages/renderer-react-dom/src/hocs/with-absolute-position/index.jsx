import { zero } from "@inglorious/utils/vectors"

import classes from "./with-absolute-position.module.scss"

export function withAbsolutePosition(Component) {
  return function AbsolutePosition(props) {
    const [, gameHeight] = props.entities.game.size
    const { position = zero() } = props.entity

    const [x, y, z] = position

    return (
      <Component
        {...props}
        className={classes.withAbsolutePosition}
        style={{ "--x": `${x}px`, "--y": `${gameHeight - y - z}px` }}
      />
    )
  }
}
