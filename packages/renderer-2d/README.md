# Inglorious Renderer 2D

Renders entities to a Canvas2D context. Renderer-agnostic on the engine's side: the
engine never imports from here, it only knows that a type has a `render`.

## Images

### `renderImage(entity, ctx, api)`

Draws the entity's image. A frame is said in the sheet's own units, so there is one place
to say it rather than two that have to be kept in step:

| on `entity.image`                                                            | on the entity                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `id`, `src`, `x`, `y` — where in the sheet the frame starts, **in pixels**   | `anchor`, `flipX`, `flipY`, `opacity`, `scale` |
| `imageSize` — how big the whole sheet is                                     |                                                |
| `tileSize` — how big one cell of its grid is; the default is the whole sheet |                                                |
| `frameSize` — how much of it this frame reads; the default is a whole cell   |                                                |

A frame wider than a cell, or sitting inside one with background around it, says so with
`frameSize`. `imageSize` is left alone by anything that crops, because it is what tells a
sheet into how many cells it cuts — so it must keep meaning the whole sheet.

```js
const types = {
  Brick: [
    {
      render: renderImage,
      create(entity) {
        // Anywhere else in the game would be the wrong place for this, but the sheet is
        // described once and every brick is pointed at one frame of it.
        entity.image = {
          id: "breakout",
          imageSize: [192, 256],
          tileSize: [32, 16],
          x: 96,
          y: 48,
          frameSize: [32, 16],
        }
      },
    },
  ],
}
```

## Anchors

Sprites and shapes can be anchored by any of nine points, named in
`@inglorious/engine/physics/anchor.js` rather than written as pairs of numbers:

```js
import { BOTTOM_LEFT, TOP_LEFT } from "@inglorious/engine/physics/anchor.js"

// Drawn from its top left corner, which is where a sprite sheet's own coordinates point.
{ type: "Ball", position: v(212, 40, 0), size: v(8, 8, 0), anchor: TOP_LEFT }

// Sitting on the position, which is what a floor is.
{ type: "Platform", position: v(0, 0, 0), size: v(64, 16, 0), anchor: BOTTOM_LEFT }
```

`TOP_LEFT`, `TOP_CENTER`, `TOP_RIGHT`, `LEFT`, `CENTER`, `RIGHT`, `BOTTOM_LEFT`,
`BOTTOM_CENTER`, `BOTTOM_RIGHT`. Anchors count from the top on both vertical axes, so
`BOTTOM_LEFT` is on the floor. `CENTER` is the default.

## Shapes

`renderRectangle`, `renderCircle`, `renderLine`, `renderText` and friends. Each takes its
geometry from the entity (`position`, `size`, `rotation`, `color`, `opacity`) so that a
shape and the sprite standing in for it cannot drift apart.
