import { spriteAnimationSystem } from "@inglorious/engine/systems/sprite-animation.js"
import { renderSprite } from "@inglorious/renderer-2d/image/sprite.js"
import { v } from "@inglorious/utils/v.js"

export default {
  systems: [spriteAnimationSystem()],

  types: {
    cat: [
      { render: renderSprite },
      {
        create(entity) {
          entity.sprite.state = "sleepy"
        },
      },
    ],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
      pixelated: true,
    },

    images: {
      type: "images",
      images: {
        neko: { url: "/sprites/neko.png" },
      },
    },

    neko: {
      type: "cat",
      position: v(400, 0, 300),
      sprite: {
        image: {
          id: "neko",
          imageSize: v(192, 192),
          tileSize: v(32, 32),
        },
        scale: 2,
        speed: 0.2,
        frames: {
          sleepy: [4, 10, 10, 3, 9, 15, 9, 15, 15],
        },
      },
    },
  },
}
