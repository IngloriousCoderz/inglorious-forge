import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    image: [{ render: renderImage }],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    logo: {
      type: "image",
      position: v(400 - 128 / 2, 0, 300 + 128 / 2),
      image: {
        id: "logo",
        src: "/logo.png",
        imageSize: v(128, 128),
      },
    },
  },
}
