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

    images: {
      type: "images",
      images: {
        logo: { url: "/logo.png" },
      },
    },

    logo: {
      type: "image",
      position: v(400 - 128 / 2, 0, 300 + 128 / 2),
      image: {
        id: "logo",
        imageSize: v(128, 128),
      },
    },
  },
}
