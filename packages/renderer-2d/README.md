# Inglorious Renderer 2D

Renders entities to a Canvas2D context. Renderer-agnostic on the engine's side: the
engine never imports from here, it only knows that a type has a `render`.

## Images

### `renderImage(entity, ctx, api)`

Draws the entity's image. The crop is taken in two places, which is worth knowing before
you reach past `crop`:

| on the entity                                     | on `entity.image`                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `sx`, `sy` — which tile, as indices on `tileSize` | `id`, `imageSize`, `tileSize`, `frameSize`, `scale`, `opacity`, `src` |

`sx`/`sy` are **tile indices, not pixels**. `renderImage` multiplies them by `tileSize`
before drawing, so `sy: 4` on a 16px-tall grid is 64 pixels down the sheet. Reading them
as pixels is the single easiest way to crop the wrong thing.

Also on the entity: `anchor`, `flipX`, `flipY`, `opacity`.

### `crop(entity, id, frame)`

Points an entity at one frame of a sprite sheet, in one call. Prefer this over setting
the fields above by hand: the split between the entity and its image is a sharp edge, and
every sprite otherwise has to remember it.

```js
import { crop } from "@inglorious/renderer-2d/image/crop.js"

const types = {
  Brick: [
    { render: renderImage },

    {
      create(entity) {
        crop(entity, "breakout", brickFrame())
      },
    },
  ],
}

const brickFrame = () => ({
  x: 0, //  left edge on the sheet, in pixels
  y: 0, //  top edge, in pixels
  width: 32,
  height: 16,
  tileSize: [32, 16], //  how the sheet is divided
})
```

The frame is given in **pixels** and divided down to the grid for you, because the grid is
what the renderer multiplies back up. `width`/`height` default to the entity's own `size`,
and `tileSize` defaults to the frame, in which case the whole sheet is one tile.

Whatever `entity.image` already carried is kept — a `scale` set beforehand survives —
because cropping says where to look, not what to do with what is found there. A
`collisions` block declared on an entity likewise still overrides `solid`.

A frame may be wider or smaller than a cell. `frameSize` is set to the frame's own size,
so a frame spanning two cells is read whole and a frame inset inside one does not bring
its background along.

### Sprite sheets

For a sheet that is cut on a uniform grid with no sub-cell cropping, `renderSprite` and
the `Sprite` behaviour address tiles by index instead and also handle animation. Reach
for `crop` when a frame is bigger than a cell, or sits inside one.

### `flipped(frame)`

A frame can be mirrored, and a mirrored frame is written as the frame's own number with a
flag set in the top bit. `flipped` is that, written down:

```js
import { flipped } from "@inglorious/renderer-2d/image/flags.js"

const entities = {
  cat: {
    type: "Cat",
    sprite: {
      image: { id: "neko", imageSize: [192, 192], tileSize: [32, 32] },
      frames: {
        right: [16, 17, 18],
        left: [flipped(16), flipped(17), flipped(18)],
      },
    },
  },
}
```

Both `renderSprite` and `renderTilemap` read the flag back out, so a frame list can mix
mirrored and plain frames freely. The two flags they read are exported from the same
place, should you need to take a frame apart yourself.

## Shapes

`renderRectangle`, `renderCircle`, `renderLine`, `renderText` and friends. Each takes its
geometry from the entity (`position`, `size`, `rotation`, `color`, `opacity`) so that a
shape and the sprite standing in for it cannot drift apart.
